import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class FunctionalTestRunner implements ITestTypeRunner {
    type: "FUNCTIONAL";
    run(config: TestRunConfig): Promise<TestTypeResult>;
    private parseOutput;
    private mapStatus;
    private errorResult;
}
