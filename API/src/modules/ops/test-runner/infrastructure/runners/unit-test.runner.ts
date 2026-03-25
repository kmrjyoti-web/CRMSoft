import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { TestType } from '@prisma/platform-client';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

@Injectable()
export class UnitTestRunner implements ITestTypeRunner {
  type = TestType.UNIT;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const args = ['--json', '--forceExit', '--passWithNoTests'];

    if (config.targetModules?.length) {
      const pattern = config.targetModules.map(m => `src/modules/${m}/`).join('|');
      args.push('--testPathPattern', `"${pattern}"`);
    }

    // Exclude e2e specs
    args.push('--testPathIgnorePatterns', '".*\\.e2e-spec\\.ts$"');

    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (config.testEnvDbUrl) {
      env.PLATFORM_DATABASE_URL = config.testEnvDbUrl;
      env.IDENTITY_DATABASE_URL = config.testEnvDbUrl;
      env.GLOBAL_WORKING_DATABASE_URL = config.testEnvDbUrl;
      env.MARKETPLACE_DATABASE_URL = config.testEnvDbUrl;
    }

    try {
      const output = execSync(`npx jest ${args.join(' ')} 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: config.timeout ?? 300_000,
        cwd: process.cwd(),
        env,
      });
      return this.parseJestOutput(output, startTime);
    } catch (error: any) {
      // Jest exits code 1 on test failures — stdout still has JSON
      if (error.stdout) return this.parseJestOutput(error.stdout, startTime);
      return {
        type: TestType.UNIT,
        total: 1, passed: 0, failed: 0, skipped: 0, errors: 1,
        duration: Date.now() - startTime,
        results: [{
          suiteName: 'UnitTests', testName: 'Jest execution',
          status: 'ERROR', duration: 0,
          errorMessage: error.message?.substring(0, 500),
        }],
      };
    }
  }

  parseJestOutput(raw: string, startTime: number): TestTypeResult {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1) {
      return {
        type: TestType.UNIT, total: 0, passed: 0, failed: 0, skipped: 0, errors: 1,
        duration: Date.now() - startTime,
        results: [{ suiteName: 'UnitTests', testName: 'Parse', status: 'ERROR', duration: 0, errorMessage: 'No JSON in Jest output' }],
      };
    }

    const jestResult = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
    const results: SingleTestResult[] = [];

    for (const suite of jestResult.testResults ?? []) {
      const filePath = (suite.testFilePath ?? '').replace(process.cwd() + '/', '');
      const module = this.extractModule(filePath);
      const suiteName =
        suite.testResults?.[0]?.ancestorTitles?.[0] ||
        filePath.split('/').pop()?.replace('.spec.ts', '') ||
        'Unknown';

      for (const test of suite.testResults ?? []) {
        const errorMsg = (test.failureMessages ?? []).join('\n');
        results.push({
          suiteName,
          testName: test.title ?? test.fullName ?? 'Unknown',
          filePath,
          module,
          status: this.mapStatus(test.status),
          duration: test.duration ?? 0,
          errorMessage: errorMsg ? errorMsg.substring(0, 2000) : undefined,
          errorStack: test.failureDetails?.[0]?.stack?.substring(0, 3000),
        });
      }
    }

    const totalDuration = (jestResult.testResults ?? []).reduce(
      (sum: number, s: any) => sum + ((s.endTime ?? 0) - (s.startTime ?? 0)),
      0,
    );

    return {
      type: TestType.UNIT,
      total: jestResult.numTotalTests ?? 0,
      passed: jestResult.numPassedTests ?? 0,
      failed: jestResult.numFailedTests ?? 0,
      skipped: jestResult.numPendingTests ?? 0,
      errors: 0,
      duration: totalDuration || (Date.now() - startTime),
      results,
    };
  }

  private extractModule(filePath: string): string {
    const match = filePath.match(/modules\/(?:customer|softwarevendor|core|marketplace|ops)\/([^/]+)/);
    return match?.[1] ?? 'unknown';
  }

  private mapStatus(jestStatus: string): SingleTestResult['status'] {
    switch (jestStatus) {
      case 'passed': return 'PASS';
      case 'failed': return 'FAIL';
      case 'pending': case 'skipped': case 'todo': return 'SKIP';
      default: return 'ERROR';
    }
  }
}
