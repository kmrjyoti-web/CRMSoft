export class CreateOfferCommand {
  constructor(
    public readonly tenantId: string,
    public readonly authorId: string,
    public readonly createdById: string,
    public readonly title: string,
    public readonly offerType: string,
    public readonly discountType: string,
    public readonly discountValue: number,
    public readonly description?: string,
    public readonly mediaUrls?: any[],
    public readonly linkedListingIds?: string[],
    public readonly linkedCategoryIds?: string[],
    public readonly primaryListingId?: string,
    public readonly conditions?: any,
    public readonly maxRedemptions?: number,
    public readonly autoCloseOnLimit?: boolean,
    public readonly resetTime?: string,
    public readonly publishAt?: Date,
    public readonly expiresAt?: Date,
  ) {}
}
