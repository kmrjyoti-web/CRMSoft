export declare class CreateOfferCommand {
    readonly tenantId: string;
    readonly authorId: string;
    readonly createdById: string;
    readonly title: string;
    readonly offerType: string;
    readonly discountType: string;
    readonly discountValue: number;
    readonly description?: string | undefined;
    readonly mediaUrls?: any[] | undefined;
    readonly linkedListingIds?: string[] | undefined;
    readonly linkedCategoryIds?: string[] | undefined;
    readonly primaryListingId?: string | undefined;
    readonly conditions?: Record<string, unknown> | undefined;
    readonly maxRedemptions?: number | undefined;
    readonly autoCloseOnLimit?: boolean | undefined;
    readonly resetTime?: string | undefined;
    readonly publishAt?: Date | undefined;
    readonly expiresAt?: Date | undefined;
    constructor(tenantId: string, authorId: string, createdById: string, title: string, offerType: string, discountType: string, discountValue: number, description?: string | undefined, mediaUrls?: any[] | undefined, linkedListingIds?: string[] | undefined, linkedCategoryIds?: string[] | undefined, primaryListingId?: string | undefined, conditions?: Record<string, unknown> | undefined, maxRedemptions?: number | undefined, autoCloseOnLimit?: boolean | undefined, resetTime?: string | undefined, publishAt?: Date | undefined, expiresAt?: Date | undefined);
}
