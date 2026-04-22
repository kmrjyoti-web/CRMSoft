export class GetListingQuery {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
