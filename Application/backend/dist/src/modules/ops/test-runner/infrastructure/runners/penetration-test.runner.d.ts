import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class PenetrationTestRunner implements ITestTypeRunner {
    type: "PENETRATION";
    run(config: TestRunConfig): Promise<TestTypeResult>;
    private testSqlInjection;
    private testXss;
    private testAuthBypass;
    private testTenantIsolation;
    private testRateLimiting;
    private runDbValidationSuite;
    private checkForeignKeys;
    private checkNullConstraints;
    private checkUniqueConstraints;
    private checkIndexIntegrity;
    private checkFinancialTransactionPostings;
    private checkEnumSync;
    private checkCascadeDeleteBehavior;
    private checkTransactionIntegrity;
    private isFinancialModuleIncluded;
    private testSecurityHeaders;
}
