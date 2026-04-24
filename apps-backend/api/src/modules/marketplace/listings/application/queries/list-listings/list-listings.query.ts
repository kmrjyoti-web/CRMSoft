export class ListListingsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: string,
    public readonly listingType?: string,
    public readonly categoryId?: string,
    public readonly search?: string,
    public readonly authorId?: string,
  ) {}
}
