export declare class UpdateSavedFilterCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: Partial<{
        name: string;
        description: string;
        filterConfig: Record<string, unknown>;
        isDefault: boolean;
        isShared: boolean;
        sharedWithRoles: string[];
    }>;
    constructor(id: string, userId: string, data: Partial<{
        name: string;
        description: string;
        filterConfig: Record<string, unknown>;
        isDefault: boolean;
        isShared: boolean;
        sharedWithRoles: string[];
    }>);
}
