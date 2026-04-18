import type { ITestTypeRunner, TestRunConfig, TestTypeResult } from './test-runner.interface';
export declare class ArchitectureTestRunner implements ITestTypeRunner {
    type: "ARCHITECTURE";
    run(config: TestRunConfig): Promise<TestTypeResult>;
    private runDepCruiser;
    private checkDomainLayerPurity;
    private checkCircularDeps;
    private checkDbClientIsolation;
    private checkNamingConventions;
    private checkIllegalImplementations;
    private checkUnsafePatterns;
    private extractModule;
}
