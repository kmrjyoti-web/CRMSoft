export class ListReviewsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly listingId?: string,
    public readonly reviewerId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
