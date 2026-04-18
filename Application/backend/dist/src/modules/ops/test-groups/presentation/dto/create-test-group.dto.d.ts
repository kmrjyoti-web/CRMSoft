export declare class CreateTestGroupDto {
    name: string;
    nameHi?: string;
    description?: string;
    icon?: string;
    color?: string;
    modules: string[];
    steps: Record<string, unknown>[];
    estimatedDuration?: number;
}
export declare class UpdateTestGroupDto {
    name?: string;
    nameHi?: string;
    description?: string;
    icon?: string;
    color?: string;
    modules?: string[];
    steps?: Record<string, unknown>[];
    status?: string;
    estimatedDuration?: number;
}
