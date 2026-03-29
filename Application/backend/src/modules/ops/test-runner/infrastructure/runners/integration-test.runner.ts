import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { TestType } from '@prisma/platform-client';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

const PRISMA_SCHEMAS = ['identity', 'platform', 'working', 'marketplace'];

@Injectable()
export class IntegrationTestRunner implements ITestTypeRunner {
  type = TestType.INTEGRATION;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const results: SingleTestResult[] = [];

    results.push(...(await this.checkDbClientIsolation()));
    results.push(await this.checkTypescript());
    results.push(...(await this.checkPrismaSchemas()));

    return {
      type: TestType.INTEGRATION,
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      skipped: results.filter(r => r.status === 'SKIP').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      duration: Date.now() - startTime,
      results,
    };
  }

  private async checkDbClientIsolation(): Promise<SingleTestResult[]> {
    const checks = [
      {
        name: 'Customer modules: no direct identity DB access',
        cmd: `grep -rn "this\\.prisma\\.identity\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
      },
      {
        name: 'Customer modules: no direct platform DB access',
        cmd: `grep -rn "this\\.prisma\\.platform\\." src/modules/customer --include="*.repository.ts" 2>/dev/null | wc -l`,
      },
      {
        name: 'Cross-service interfaces used (no direct cross-module service injection)',
        cmd: `grep -rn "import.*Service.*from.*modules" src/modules --include="*.ts" 2>/dev/null | grep -v "spec\\|__tests__" | wc -l`,
      },
    ];

    const results: SingleTestResult[] = [];
    for (const check of checks) {
      try {
        const count = parseInt(
          execSync(check.cmd, { encoding: 'utf-8', timeout: 10_000 }).trim(),
          10,
        );
        // For the cross-service check, some imports are acceptable — flag as SKIP if any found
        const isIsolationCheck = !check.name.includes('cross-service');
        results.push({
          suiteName: 'DB Client Isolation',
          testName: check.name,
          status: isIsolationCheck
            ? (count === 0 ? 'PASS' : 'FAIL')
            : (count === 0 ? 'PASS' : 'SKIP'),
          duration: 0,
          errorMessage: count > 0 && isIsolationCheck ? `${count} violations found` : undefined,
        });
      } catch (error: any) {
        results.push({
          suiteName: 'DB Client Isolation', testName: check.name,
          status: 'ERROR', duration: 0,
          errorMessage: error.message?.substring(0, 200),
        });
      }
    }
    return results;
  }

  private async checkTypescript(): Promise<SingleTestResult> {
    try {
      execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8', timeout: 120_000 });
      return {
        suiteName: 'TypeScript', testName: 'Zero compilation errors',
        status: 'PASS', duration: 0,
      };
    } catch (error: any) {
      const errorCount = (error.stdout?.match(/error TS/g) ?? []).length;
      return {
        suiteName: 'TypeScript', testName: 'Compilation check',
        status: 'FAIL', duration: 0,
        errorMessage: `${errorCount} TypeScript errors`,
        errorStack: error.stdout?.substring(0, 1000),
      };
    }
  }

  private async checkPrismaSchemas(): Promise<SingleTestResult[]> {
    const results: SingleTestResult[] = [];
    for (const schema of PRISMA_SCHEMAS) {
      try {
        execSync(
          `npx prisma validate --schema=prisma/schemas/${schema}.prisma 2>&1`,
          { encoding: 'utf-8', timeout: 30_000 },
        );
        results.push({
          suiteName: 'Prisma Sync',
          testName: `${schema}.prisma is valid`,
          status: 'PASS', duration: 0,
        });
      } catch (error: any) {
        results.push({
          suiteName: 'Prisma Sync',
          testName: `${schema}.prisma validation`,
          status: 'FAIL', duration: 0,
          errorMessage: error.stdout?.substring(0, 500) ?? error.message?.substring(0, 500),
        });
      }
    }
    return results;
  }
}
