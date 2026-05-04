import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { TestType } from '@prisma/platform-client';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

@Injectable()
export class FunctionalTestRunner implements ITestTypeRunner {
  type = TestType.FUNCTIONAL;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const args = [
      '--config', 'test/jest-e2e.json',
      '--json', '--forceExit', '--passWithNoTests',
    ];

    if (config.targetModules?.length) {
      args.push('--testPathPattern', `"${config.targetModules.map(m => `test/e2e/${m}`).join('|')}"`);
    }

    try {
      const output = execSync(`npx jest ${args.join(' ')} 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: config.timeout ?? 600_000,
        cwd: process.cwd(),
      });
      return this.parseOutput(output, startTime);
    } catch (error: any) {
      if (error.stdout) return this.parseOutput(error.stdout, startTime);
      return this.errorResult(error.message, startTime);
    }
  }

  private parseOutput(raw: string, startTime: number): TestTypeResult {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1) return this.errorResult('No JSON output from Jest E2E', startTime);

    let jestResult: any;
    try {
      jestResult = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
    } catch {
      return this.errorResult('Failed to parse Jest E2E output', startTime);
    }

    const results: SingleTestResult[] = [];

    for (const suite of jestResult.testResults ?? []) {
      const filePath = (suite.testFilePath ?? '').replace(process.cwd() + '/', '');
      const suiteName =
        suite.testResults?.[0]?.ancestorTitles?.[0] ||
        filePath.split('/').pop()?.replace('.e2e-spec.ts', '') ||
        'E2E';

      for (const test of suite.testResults ?? []) {
        const errorMsg = (test.failureMessages ?? []).join('\n');
        results.push({
          suiteName,
          testName: test.title ?? test.fullName ?? 'Unknown',
          filePath,
          status: this.mapStatus(test.status),
          duration: test.duration ?? 0,
          errorMessage: errorMsg ? errorMsg.substring(0, 2000) : undefined,
        });
      }
    }

    const totalDuration = (jestResult.testResults ?? []).reduce(
      (sum: number, s: any) => sum + ((s.endTime ?? 0) - (s.startTime ?? 0)),
      0,
    );

    return {
      type: TestType.FUNCTIONAL,
      total: jestResult.numTotalTests ?? 0,
      passed: jestResult.numPassedTests ?? 0,
      failed: jestResult.numFailedTests ?? 0,
      skipped: jestResult.numPendingTests ?? 0,
      errors: 0,
      duration: totalDuration || (Date.now() - startTime),
      results,
    };
  }

  private mapStatus(jestStatus: string): SingleTestResult['status'] {
    switch (jestStatus) {
      case 'passed': return 'PASS';
      case 'failed': return 'FAIL';
      case 'pending': case 'skipped': return 'SKIP';
      default: return 'ERROR';
    }
  }

  private errorResult(message: string, startTime: number): TestTypeResult {
    return {
      type: TestType.FUNCTIONAL,
      total: 1, passed: 0, failed: 0, skipped: 0, errors: 1,
      duration: Date.now() - startTime,
      results: [{
        suiteName: 'FunctionalTests', testName: 'E2E execution',
        status: 'ERROR', duration: 0,
        errorMessage: message?.substring(0, 500),
      }],
    };
  }
}
