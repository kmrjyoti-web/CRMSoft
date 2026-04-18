export declare class CreateReviewCommand {
    readonly tenantId: string;
    readonly listingId: string;
    readonly reviewerId: string;
    readonly rating: number;
    readonly title?: string | undefined;
    readonly body?: string | undefined;
    readonly mediaUrls?: any[] | undefined;
    readonly orderId?: string | undefined;
    constructor(tenantId: string, listingId: string, reviewerId: string, rating: number, title?: string | undefined, body?: string | undefined, mediaUrls?: any[] | undefined, orderId?: string | undefined);
}
