export declare class ListReviewsQuery {
    readonly tenantId: string;
    readonly listingId?: string | undefined;
    readonly reviewerId?: string | undefined;
    readonly status?: string | undefined;
    readonly page: number;
    readonly limit: number;
    constructor(tenantId: string, listingId?: string | undefined, reviewerId?: string | undefined, status?: string | undefined, page?: number, limit?: number);
}
