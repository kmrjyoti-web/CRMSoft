export class CreatePostCommand {
  constructor(
    public readonly tenantId: string,
    public readonly authorId: string,
    public readonly createdById: string,
    public readonly postType: string,
    public readonly content?: string,
    public readonly mediaUrls?: any[],
    public readonly linkedListingId?: string,
    public readonly linkedOfferId?: string,
    public readonly rating?: number,
    public readonly productId?: string,
    public readonly visibility?: string,
    public readonly visibilityConfig?: any,
    public readonly publishAt?: Date,
    public readonly expiresAt?: Date,
    public readonly hashtags?: string[],
    public readonly mentions?: string[],
    public readonly pollConfig?: any,
  ) {}
}
