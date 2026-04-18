export declare class ListTestEnvsQuery {
    readonly tenantId: string;
    readonly status?: string | undefined;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(tenantId: string, status?: string | undefined, page?: number | undefined, limit?: number | undefined);
}
