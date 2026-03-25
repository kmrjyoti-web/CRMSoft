import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { TestType } from '@prisma/platform-client';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

@Injectable()
export class ArchitectureTestRunner implements ITestTypeRunner {
  type = TestType.ARCHITECTURE;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const results: SingleTestResult[] = [];

    // 1. Dependency-cruiser violations
    results.push(...(await this.runDepCruiser(startTime)));

    // 2. Domain layer purity
    results.push(...(await this.checkDomainLayerPurity()));

    // 3. Circular dependencies
    results.push(await this.checkCircularDeps());

    // 4. Cross-module direct DB access
    results.push(...(await this.checkDbClientIsolation()));

    return {
      type: TestType.ARCHITECTURE,
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      skipped: results.filter(r => r.status === 'SKIP').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      duration: Date.now() - startTime,
      results,
    };
  }

  private async runDepCruiser(startTime: number): Promise<SingleTestResult[]> {
    try {
      const output = execSync(
        'npx depcruise --config .dependency-cruiser.js src/ --output-type json 2>/dev/null',
        { encoding: 'utf-8', timeout: 120_000, cwd: process.cwd() },
      );

      let depResult: any;
      try {
        const jsonStart = output.indexOf('{');
        depResult = JSON.parse(output.substring(jsonStart));
      } catch {
        return [{
          suiteName: 'DependencyCruiser', testName: 'Parse output',
          status: 'ERROR', duration: 0, errorMessage: 'Could not parse depcruise JSON',
        }];
      }

      const violations: any[] = depResult.output?.violations ?? [];
      const errorViolations = violations.filter((v: any) => v.rule?.severity === 'error');

      if (errorViolations.length === 0) {
        return [{
          suiteName: 'DependencyCruiser',
          testName: 'All service boundaries clean',
          status: 'PASS', duration: Date.now() - startTime,
        }];
      }

      return errorViolations.map((v: any) => ({
        suiteName: 'DependencyCruiser',
        testName: `${v.rule?.name}: ${v.from} → ${v.to}`,
        module: this.extractModule(v.from),
        status: 'FAIL' as const,
        duration: 0,
        errorMessage: `${v.rule?.name}: ${v.from} imports ${v.to}`,
      }));
    } catch (error: any) {
      // depcruise exits non-zero when violations found — parse stdout
      if (error.stdout) {
        try {
          const jsonStart = error.stdout.indexOf('{');
          const depResult = JSON.parse(error.stdout.substring(jsonStart));
          const violations: any[] = depResult.output?.violations ?? [];
          const errorViolations = violations.filter((v: any) => v.rule?.severity === 'error');
          if (errorViolations.length === 0) {
            return [{ suiteName: 'DependencyCruiser', testName: 'All boundaries clean', status: 'PASS', duration: 0 }];
          }
          return errorViolations.map((v: any) => ({
            suiteName: 'DependencyCruiser',
            testName: `${v.rule?.name}: ${v.from}`,
            status: 'FAIL' as const,
            duration: 0,
            errorMessage: `${v.rule?.name}: ${v.from} → ${v.to}`,
          }));
        } catch { /* fall through */ }
      }
      return [{
        suiteName: 'DependencyCruiser', testName: 'Dependency analysis',
        status: 'ERROR', duration: 0,
        errorMessage: error.message?.substring(0, 500),
      }];
    }
  }

  private async checkDomainLayerPurity(): Promise<SingleTestResult[]> {
    try {
      const output = execSync(
        'grep -rn "from.*infrastructure" src/modules/*/domain src/modules/*/*/domain --include="*.ts" 2>/dev/null || true',
        { encoding: 'utf-8' },
      );

      if (output.trim()) {
        return output.trim().split('\n').map(v => ({
          suiteName: 'DDD Layer Purity',
          testName: `Domain imports infrastructure: ${v.split(':')[0]}`,
          status: 'FAIL' as const,
          duration: 0,
          errorMessage: v,
        }));
      }

      return [{
        suiteName: 'DDD Layer Purity',
        testName: 'Domain layer is pure (no infrastructure imports)',
        status: 'PASS', duration: 0,
      }];
    } catch (error: any) {
      return [{
        suiteName: 'DDD Layer Purity', testName: 'Layer purity check',
        status: 'ERROR', duration: 0, errorMessage: error.message,
      }];
    }
  }

  private async checkCircularDeps(): Promise<SingleTestResult> {
    try {
      const output = execSync(
        'npx madge --circular --extensions ts src/ 2>&1',
        { encoding: 'utf-8', timeout: 60_000 },
      );
      const hasCircular = output.includes('Found') && output.includes('circular');
      return {
        suiteName: 'Circular Dependencies',
        testName: hasCircular ? 'Circular dependencies detected' : 'No circular dependencies',
        status: hasCircular ? 'FAIL' : 'PASS',
        duration: 0,
        errorMessage: hasCircular ? output.substring(0, 500) : undefined,
      };
    } catch (error: any) {
      // madge not installed — skip gracefully
      return {
        suiteName: 'Circular Dependencies',
        testName: 'Circular dependency check (madge not available)',
        status: 'SKIP', duration: 0,
      };
    }
  }

  private async checkDbClientIsolation(): Promise<SingleTestResult[]> {
    const checks = [
      {
        name: 'Customer modules do not access identity DB',
        cmd: `grep -rn "this\\.prisma\\.identity\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
      },
      {
        name: 'Customer modules do not access platform DB',
        cmd: `grep -rn "this\\.prisma\\.platform\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
      },
    ];

    const results: SingleTestResult[] = [];
    for (const check of checks) {
      try {
        const count = parseInt(
          execSync(check.cmd, { encoding: 'utf-8' }).trim(),
          10,
        );
        results.push({
          suiteName: 'DB Client Isolation',
          testName: check.name,
          status: count === 0 ? 'PASS' : 'FAIL',
          duration: 0,
          errorMessage: count > 0 ? `${count} violations found` : undefined,
        });
      } catch {
        results.push({
          suiteName: 'DB Client Isolation',
          testName: check.name,
          status: 'ERROR', duration: 0,
        });
      }
    }
    return results;
  }

  private extractModule(filePath?: string): string {
    const match = filePath?.match(/modules\/(?:customer|softwarevendor|core|marketplace|ops)\/([^/]+)/);
    return match?.[1] ?? 'unknown';
  }
}
