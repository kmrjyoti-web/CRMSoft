export declare class ListTestRunsQuery {
    readonly tenantId: string;
    readonly filters: {
        status?: string;
        page?: number;
        limit?: number;
    };
    constructor(tenantId: string, filters: {
        status?: string;
        page?: number;
        limit?: number;
    });
}
