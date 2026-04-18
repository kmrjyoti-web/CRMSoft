import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class UnitTestRunner implements ITestTypeRunner {
    type: "UNIT";
    run(config: TestRunConfig): Promise<TestTypeResult>;
    parseJestOutput(raw: string, startTime: number): TestTypeResult;
    private extractModule;
    private mapStatus;
}
