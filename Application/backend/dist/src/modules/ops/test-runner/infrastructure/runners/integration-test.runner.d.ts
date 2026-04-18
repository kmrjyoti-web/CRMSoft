import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class IntegrationTestRunner implements ITestTypeRunner {
    type: "INTEGRATION";
    run(config: TestRunConfig): Promise<TestTypeResult>;
    private checkDbClientIsolation;
    private checkTypescript;
    private checkPrismaSchemas;
}
