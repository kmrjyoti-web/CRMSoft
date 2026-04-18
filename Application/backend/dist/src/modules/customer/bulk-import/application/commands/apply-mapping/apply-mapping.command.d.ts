export declare class ApplyMappingCommand {
    readonly jobId: string;
    readonly fieldMapping: Record<string, unknown>[];
    readonly validationRules?: Record<string, unknown>[] | undefined;
    readonly duplicateCheckFields?: string[] | undefined;
    readonly duplicateStrategy?: string | undefined;
    readonly fuzzyMatchEnabled?: boolean | undefined;
    readonly fuzzyMatchFields?: string[] | undefined;
    readonly fuzzyThreshold?: number | undefined;
    readonly defaultValues?: Record<string, unknown> | undefined;
    constructor(jobId: string, fieldMapping: Record<string, unknown>[], validationRules?: Record<string, unknown>[] | undefined, duplicateCheckFields?: string[] | undefined, duplicateStrategy?: string | undefined, fuzzyMatchEnabled?: boolean | undefined, fuzzyMatchFields?: string[] | undefined, fuzzyThreshold?: number | undefined, defaultValues?: Record<string, unknown> | undefined);
}
