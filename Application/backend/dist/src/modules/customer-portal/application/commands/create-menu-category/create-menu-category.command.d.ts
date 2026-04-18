export declare class CreateMenuCategoryCommand {
    readonly tenantId: string;
    readonly adminId: string;
    readonly name: string;
    readonly enabledRoutes: string[];
    readonly nameHi?: string | undefined;
    readonly description?: string | undefined;
    readonly icon?: string | undefined;
    readonly color?: string | undefined;
    readonly isDefault?: boolean | undefined;
    readonly sortOrder?: number | undefined;
    constructor(tenantId: string, adminId: string, name: string, enabledRoutes: string[], nameHi?: string | undefined, description?: string | undefined, icon?: string | undefined, color?: string | undefined, isDefault?: boolean | undefined, sortOrder?: number | undefined);
}
