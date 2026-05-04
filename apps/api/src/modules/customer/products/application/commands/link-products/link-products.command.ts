export class LinkProductsCommand {
  constructor(
    public readonly fromProductId: string,
    public readonly toProductId: string,
    public readonly relationType: string,
  ) {}
}
