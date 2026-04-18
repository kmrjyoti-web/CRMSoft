import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class SmokeTestRunner implements ITestTypeRunner {
    type: "SMOKE";
    run(config: TestRunConfig): Promise<TestTypeResult>;
}
