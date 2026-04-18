export declare class CreateProfileCommand {
    readonly name: string;
    readonly targetEntity: string;
    readonly fieldMapping: Record<string, unknown>[];
    readonly expectedHeaders: string[];
    readonly createdById: string;
    readonly createdByName: string;
    readonly description?: string | undefined;
    readonly sourceSystem?: string | undefined;
    readonly icon?: string | undefined;
    readonly color?: string | undefined;
    readonly defaultValues?: Record<string, unknown> | undefined;
    readonly validationRules?: Record<string, unknown>[] | undefined;
    readonly duplicateCheckFields?: string[] | undefined;
    readonly duplicateStrategy?: string | undefined;
    readonly fuzzyMatchEnabled?: boolean | undefined;
    readonly fuzzyMatchFields?: string[] | undefined;
    readonly fuzzyThreshold?: number | undefined;
    constructor(name: string, targetEntity: string, fieldMapping: Record<string, unknown>[], expectedHeaders: string[], createdById: string, createdByName: string, description?: string | undefined, sourceSystem?: string | undefined, icon?: string | undefined, color?: string | undefined, defaultValues?: Record<string, unknown> | undefined, validationRules?: Record<string, unknown>[] | undefined, duplicateCheckFields?: string[] | undefined, duplicateStrategy?: string | undefined, fuzzyMatchEnabled?: boolean | undefined, fuzzyMatchFields?: string[] | undefined, fuzzyThreshold?: number | undefined);
}
