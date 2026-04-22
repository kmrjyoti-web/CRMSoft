export class PublishListingCommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly publishedById: string,
  ) {}
}
