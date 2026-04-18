export declare class UpdateMenuCategoryCommand {
    readonly id: string;
    readonly updates: {
        name?: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        enabledRoutes?: string[];
        isDefault?: boolean;
        isActive?: boolean;
        sortOrder?: number;
    };
    constructor(id: string, updates: {
        name?: string;
        nameHi?: string;
        description?: string;
        icon?: string;
        color?: string;
        enabledRoutes?: string[];
        isDefault?: boolean;
        isActive?: boolean;
        sortOrder?: number;
    });
}
