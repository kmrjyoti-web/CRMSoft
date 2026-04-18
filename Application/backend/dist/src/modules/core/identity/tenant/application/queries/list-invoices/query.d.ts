export declare class ListInvoicesQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    constructor(tenantId: string, page: number, limit: number, status?: string | undefined);
}
