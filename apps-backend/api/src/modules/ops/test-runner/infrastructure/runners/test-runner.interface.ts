import type { TestType } from '@prisma/platform-client';

export interface ITestTypeRunner {
  type: TestType;
  run(config: TestRunConfig): Promise<TestTypeResult>;
}

export interface TestRunConfig {
  testEnvDbUrl?: string;
  targetModules?: string[];
  timeout?: number;
}

export interface TestTypeResult {
  type: TestType;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  duration: number;
  coveragePercent?: number;
  results: SingleTestResult[];
}

export interface SingleTestResult {
  suiteName: string;
  testName: string;
  filePath?: string;
  module?: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR' | 'TIMEOUT';
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  expectedValue?: string;
  actualValue?: string;
}
