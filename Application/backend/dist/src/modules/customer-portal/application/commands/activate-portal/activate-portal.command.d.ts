export declare class ActivatePortalCommand {
    readonly tenantId: string;
    readonly adminId: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly menuCategoryId?: string | undefined;
    constructor(tenantId: string, adminId: string, entityType: string, entityId: string, menuCategoryId?: string | undefined);
}
