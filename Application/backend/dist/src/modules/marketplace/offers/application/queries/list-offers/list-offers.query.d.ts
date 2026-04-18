export declare class ListOffersQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly offerType?: string | undefined;
    readonly authorId?: string | undefined;
    constructor(tenantId: string, page?: number, limit?: number, status?: string | undefined, offerType?: string | undefined, authorId?: string | undefined);
}
