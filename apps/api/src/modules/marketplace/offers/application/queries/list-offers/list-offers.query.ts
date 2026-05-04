export class ListOffersQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: string,
    public readonly offerType?: string,
    public readonly authorId?: string,
  ) {}
}
