export declare class ListPortalUsersQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly search?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(tenantId: string, page?: number, limit?: number, search?: string | undefined, isActive?: boolean | undefined);
}
