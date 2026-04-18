export declare class GetMyMenuQuery {
    readonly userId: string;
    readonly roleId: string;
    readonly roleName: string;
    readonly isSuperAdmin?: boolean | undefined;
    readonly tenantId?: string | undefined;
    readonly businessTypeCode?: string | undefined;
    constructor(userId: string, roleId: string, roleName: string, isSuperAdmin?: boolean | undefined, tenantId?: string | undefined, businessTypeCode?: string | undefined);
}
