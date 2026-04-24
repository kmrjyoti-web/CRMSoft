export class SetSlabPriceCommand {
  constructor(
    public readonly productId: string,
    public readonly priceType: string,
    public readonly slabs: { minQty: number; maxQty?: number; amount: number }[],
  ) {}
}
