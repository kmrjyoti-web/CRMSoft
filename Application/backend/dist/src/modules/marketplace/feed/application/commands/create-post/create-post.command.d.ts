export declare class CreatePostCommand {
    readonly tenantId: string;
    readonly authorId: string;
    readonly createdById: string;
    readonly postType: string;
    readonly content?: string | undefined;
    readonly mediaUrls?: any[] | undefined;
    readonly linkedListingId?: string | undefined;
    readonly linkedOfferId?: string | undefined;
    readonly rating?: number | undefined;
    readonly productId?: string | undefined;
    readonly visibility?: string | undefined;
    readonly visibilityConfig?: Record<string, unknown> | undefined;
    readonly publishAt?: Date | undefined;
    readonly expiresAt?: Date | undefined;
    readonly hashtags?: string[] | undefined;
    readonly mentions?: string[] | undefined;
    readonly pollConfig?: Record<string, unknown> | undefined;
    constructor(tenantId: string, authorId: string, createdById: string, postType: string, content?: string | undefined, mediaUrls?: any[] | undefined, linkedListingId?: string | undefined, linkedOfferId?: string | undefined, rating?: number | undefined, productId?: string | undefined, visibility?: string | undefined, visibilityConfig?: Record<string, unknown> | undefined, publishAt?: Date | undefined, expiresAt?: Date | undefined, hashtags?: string[] | undefined, mentions?: string[] | undefined, pollConfig?: Record<string, unknown> | undefined);
}
