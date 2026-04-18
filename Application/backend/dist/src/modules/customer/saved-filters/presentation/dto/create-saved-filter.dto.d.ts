export declare class CreateSavedFilterDto {
    name: string;
    description?: string;
    entityType: string;
    filterConfig: Record<string, unknown>;
    isDefault?: boolean;
    isShared?: boolean;
    sharedWithRoles?: string[];
}
