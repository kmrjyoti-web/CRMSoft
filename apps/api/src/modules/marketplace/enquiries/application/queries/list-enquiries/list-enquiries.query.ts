export class ListEnquiriesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly listingId?: string,
    public readonly enquirerId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
