export declare class ListListingsQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly listingType?: string | undefined;
    readonly categoryId?: string | undefined;
    readonly search?: string | undefined;
    readonly authorId?: string | undefined;
    constructor(tenantId: string, page?: number, limit?: number, status?: string | undefined, listingType?: string | undefined, categoryId?: string | undefined, search?: string | undefined, authorId?: string | undefined);
}
