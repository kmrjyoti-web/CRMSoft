export declare class ListScheduledTestsQuery {
    readonly tenantId: string;
    readonly isActive?: boolean | undefined;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(tenantId: string, isActive?: boolean | undefined, page?: number | undefined, limit?: number | undefined);
}
