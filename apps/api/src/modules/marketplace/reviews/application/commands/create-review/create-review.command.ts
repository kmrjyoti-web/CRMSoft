export class CreateReviewCommand {
  constructor(
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly reviewerId: string,
    public readonly rating: number,
    public readonly title?: string,
    public readonly body?: string,
    public readonly mediaUrls?: any[],
    public readonly orderId?: string,
  ) {}
}
