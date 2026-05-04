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
