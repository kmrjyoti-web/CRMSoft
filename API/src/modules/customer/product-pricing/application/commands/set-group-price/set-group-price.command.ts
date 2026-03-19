export class SetGroupPriceCommand {
  constructor(
    public readonly productId: string,
    public readonly priceGroupId: string,
    public readonly priceType: string,
    public readonly amount: number,
  ) {}
}
