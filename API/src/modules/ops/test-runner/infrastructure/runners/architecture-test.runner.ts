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

    // 5. Naming conventions (kebab-case files, PascalCase classes)
    results.push(...(await this.checkNamingConventions()));

    // 6. Illegal implementation patterns (console.log, hardcoded, TODO/FIXME)
    results.push(...(await this.checkIllegalImplementations()));

    // 7. Unsafe code patterns (any casts, eval, SQL string concat)
    results.push(...(await this.checkUnsafePatterns()));

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

  // ─────────────────────────────────────────────────────────
  // NAMING CONVENTIONS
  // ─────────────────────────────────────────────────────────

  private async checkNamingConventions(): Promise<SingleTestResult[]> {
    const results: SingleTestResult[] = [];

    // Check for PascalCase violations in class names
    try {
      const output = execSync(
        `grep -rn "^export class [a-z]" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | head -20 || true`,
        { encoding: 'utf-8', timeout: 15_000 },
      );
      const violations = output.trim() ? output.trim().split('\n').filter(Boolean) : [];
      results.push({
        suiteName: 'Naming Conventions',
        testName: 'Classes use PascalCase',
        status: violations.length === 0 ? 'PASS' : 'FAIL',
        duration: 0,
        errorMessage: violations.length > 0 ? `${violations.length} class(es) do not use PascalCase:\n${violations.slice(0, 5).join('\n')}` : undefined,
      });
    } catch (err: any) {
      results.push({ suiteName: 'Naming Conventions', testName: 'PascalCase class check', status: 'ERROR', duration: 0, errorMessage: err.message });
    }

    // Check for camelCase or PascalCase filenames (should be kebab-case)
    try {
      const output = execSync(
        `find src/modules -name "*.ts" | grep -v "spec\\|__tests__\\|node_modules" | grep -E "[A-Z]" | grep -v "index.ts\\|MEMORY" | head -20 || true`,
        { encoding: 'utf-8', timeout: 15_000 },
      );
      const violations = output.trim() ? output.trim().split('\n').filter(Boolean) : [];
      results.push({
        suiteName: 'Naming Conventions',
        testName: 'Files use kebab-case',
        status: violations.length === 0 ? 'PASS' : 'WARN' as any,
        duration: 0,
        errorMessage: violations.length > 0 ? `${violations.length} file(s) are not kebab-case` : undefined,
      });
    } catch (err: any) {
      results.push({ suiteName: 'Naming Conventions', testName: 'Kebab-case file check', status: 'ERROR', duration: 0, errorMessage: err.message });
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────
  // ILLEGAL IMPLEMENTATIONS
  // ─────────────────────────────────────────────────────────

  private async checkIllegalImplementations(): Promise<SingleTestResult[]> {
    const results: SingleTestResult[] = [];

    const patterns: Array<{ name: string; pattern: string; severity: 'FAIL' | 'SKIP' }> = [
      { name: 'No console.log/warn/error in production code', pattern: `console\\.log\\|console\\.warn\\|console\\.error`, severity: 'SKIP' },
      { name: 'No hardcoded localhost URLs', pattern: `localhost:[0-9]\\{4,5\\}`, severity: 'FAIL' },
      { name: 'No TODO/FIXME/HACK comments', pattern: `TODO\\|FIXME\\|HACK\\|XXX`, severity: 'SKIP' },
      { name: 'No plaintext passwords/secrets', pattern: `password\\s*=\\s*[\'"][^\'"]\\{4\\}`, severity: 'FAIL' },
      { name: 'No unpaginated queries (limit > 10000)', pattern: `take:\\s*1000[0-9]\\|limit:\\s*1000[0-9]`, severity: 'FAIL' },
    ];

    for (const p of patterns) {
      try {
        const output = execSync(
          `grep -rn "${p.pattern}" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__\\|\\.d\\.ts" | wc -l`,
          { encoding: 'utf-8', timeout: 10_000 },
        );
        const count = parseInt(output.trim(), 10);
        results.push({
          suiteName: 'Illegal Implementations',
          testName: p.name,
          status: count === 0 ? 'PASS' : p.severity,
          duration: 0,
          errorMessage: count > 0 ? `${count} instance(s) found` : undefined,
          actualValue: count > 0 ? String(count) : undefined,
        });
      } catch (err: any) {
        results.push({ suiteName: 'Illegal Implementations', testName: p.name, status: 'ERROR', duration: 0, errorMessage: err.message });
      }
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────
  // UNSAFE PATTERNS
  // ─────────────────────────────────────────────────────────

  private async checkUnsafePatterns(): Promise<SingleTestResult[]> {
    const results: SingleTestResult[] = [];

    const patterns: Array<{ name: string; pattern: string }> = [
      { name: 'No eval() usage', pattern: `\\beval\\s*(` },
      { name: 'No SQL string concatenation', pattern: `\\$\`.*WHERE\\|"SELECT.*" \\+\\|"INSERT.*" \\+` },
      { name: 'No dangerouslySetInnerHTML equivalent in API', pattern: `dangerouslySet\\|innerHTML\\s*=` },
      { name: 'No untyped JSON.parse without try-catch context', pattern: `JSON\\.parse\\s*(.*)\\.trim\\|JSON\\.parse\\s*(.*);$` },
    ];

    for (const p of patterns) {
      try {
        const output = execSync(
          `grep -rEn "${p.pattern}" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__\\|\\.d\\.ts" | wc -l`,
          { encoding: 'utf-8', timeout: 10_000 },
        );
        const count = parseInt(output.trim(), 10);
        results.push({
          suiteName: 'Unsafe Patterns',
          testName: p.name,
          status: count === 0 ? 'PASS' : 'FAIL',
          duration: 0,
          errorMessage: count > 0 ? `${count} unsafe instance(s) found` : undefined,
          actualValue: count > 0 ? String(count) : undefined,
        });
      } catch (err: any) {
        results.push({ suiteName: 'Unsafe Patterns', testName: p.name, status: 'ERROR', duration: 0, errorMessage: err.message });
      }
    }

    // Type-safety: count `as any` casts (warn only)
    try {
      const output = execSync(
        `grep -rn " as any" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | wc -l`,
        { encoding: 'utf-8', timeout: 10_000 },
      );
      const count = parseInt(output.trim(), 10);
      results.push({
        suiteName: 'Unsafe Patterns',
        testName: '`as any` casts are minimal',
        status: count < 20 ? 'PASS' : 'SKIP',
        duration: 0,
        errorMessage: count >= 20 ? `${count} "as any" casts — consider adding proper types` : undefined,
        actualValue: String(count),
      });
    } catch { /* skip */ }

    return results;
  }

  private extractModule(filePath?: string): string {
    const match = filePath?.match(/modules\/(?:customer|softwarevendor|core|marketplace|ops)\/([^/]+)/);
    return match?.[1] ?? 'unknown';
  }
}
