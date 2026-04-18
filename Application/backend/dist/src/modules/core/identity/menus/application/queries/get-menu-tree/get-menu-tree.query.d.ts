export declare class GetMenuTreeQuery {
    readonly includeInactive: boolean;
    readonly tenantId?: string | undefined;
    readonly isSuperAdmin?: boolean | undefined;
    readonly industryCode?: string | undefined;
    constructor(includeInactive?: boolean, tenantId?: string | undefined, isSuperAdmin?: boolean | undefined, industryCode?: string | undefined);
}
