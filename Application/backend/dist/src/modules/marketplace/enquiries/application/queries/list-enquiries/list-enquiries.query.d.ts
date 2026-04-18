export declare class ListEnquiriesQuery {
    readonly tenantId: string;
    readonly listingId?: string | undefined;
    readonly enquirerId?: string | undefined;
    readonly status?: string | undefined;
    readonly page: number;
    readonly limit: number;
    constructor(tenantId: string, listingId?: string | undefined, enquirerId?: string | undefined, status?: string | undefined, page?: number, limit?: number);
}
