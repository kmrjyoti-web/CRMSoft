export declare class ListTestPlansQuery {
    readonly tenantId: string;
    readonly status?: string | undefined;
    readonly search?: string | undefined;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(tenantId: string, status?: string | undefined, search?: string | undefined, page?: number | undefined, limit?: number | undefined);
}
