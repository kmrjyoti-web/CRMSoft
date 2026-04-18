import { PrismaService } from "../../../../../core/prisma/prisma.service";
export interface StepResult {
    stepId: string;
    stepName: string;
    status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';
    duration: number;
    requestSent?: {
        method: string;
        url: string;
        body?: any;
    };
    responseReceived?: {
        status: number;
        body: Record<string, unknown>;
        duration: number;
    };
    assertions?: AssertionResult[];
    savedValues?: Record<string, any>;
    errorMessage?: string | null;
}
export interface AssertionResult {
    field: string;
    operator: string;
    expected: any;
    actual: any;
    passed: boolean;
}
export declare class TestGroupRunnerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(executionId: string, group: any, authToken: string): Promise<void>;
    executeStep(step: any, savedValues: Record<string, any>, authToken: string): Promise<StepResult>;
    resolveTemplateVars(obj: any, values: Record<string, any>): any;
    private getNestedValue;
    evaluateAssertion(actual: any, operator: string, expected: any): boolean;
}
