export declare class ApplyMappingDto {
    fieldMapping: Record<string, unknown>[];
    validationRules?: Record<string, unknown>[];
    duplicateCheckFields?: string[];
    duplicateStrategy?: string;
    fuzzyMatchEnabled?: boolean;
    fuzzyMatchFields?: string[];
    fuzzyThreshold?: number;
    defaultValues?: Record<string, unknown>;
}
