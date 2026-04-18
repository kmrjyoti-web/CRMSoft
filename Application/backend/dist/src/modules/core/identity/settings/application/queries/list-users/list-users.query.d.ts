export declare class ListUsersQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly search?: string | undefined;
    readonly status?: string | undefined;
    readonly userType?: string | undefined;
    readonly roleId?: string | undefined;
    constructor(tenantId: string, page?: number, limit?: number, search?: string | undefined, status?: string | undefined, userType?: string | undefined, roleId?: string | undefined);
}
