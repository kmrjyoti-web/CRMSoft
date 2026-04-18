export declare class CreateProfileDto {
    name: string;
    targetEntity: string;
    fieldMapping: Record<string, unknown>[];
    expectedHeaders: string[];
    description?: string;
    sourceSystem?: string;
    icon?: string;
    color?: string;
    defaultValues?: Record<string, unknown>;
    validationRules?: Record<string, unknown>[];
    duplicateCheckFields?: string[];
    duplicateStrategy?: string;
    fuzzyMatchEnabled?: boolean;
    fuzzyMatchFields?: string[];
    fuzzyThreshold?: number;
}
export declare class UpdateProfileDto {
    name?: string;
    description?: string;
    sourceSystem?: string;
    icon?: string;
    color?: string;
    fieldMapping?: Record<string, unknown>[];
    expectedHeaders?: string[];
    defaultValues?: Record<string, unknown>;
    validationRules?: Record<string, unknown>[];
    duplicateCheckFields?: string[];
    duplicateStrategy?: string;
    fuzzyMatchEnabled?: boolean;
    fuzzyMatchFields?: string[];
    fuzzyThreshold?: number;
}
export declare class CloneProfileDto {
    newName: string;
}
