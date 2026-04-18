export declare class UpsertOverrideDto {
    customKey: string;
}
export declare class CreateCustomShortcutDto {
    label: string;
    defaultKey: string;
    description?: string;
    category?: string;
    targetPath?: string;
    targetModule?: string;
}
export declare class UpdateDefinitionDto {
    label?: string;
    defaultKey?: string;
    isLocked?: boolean;
    isActive?: boolean;
}
export declare class CheckConflictDto {
    key: string;
    excludeShortcutId?: string;
}
