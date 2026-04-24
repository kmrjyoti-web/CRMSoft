export class GetEffectivePriceQuery {
  constructor(
    public readonly productId: string,
    public readonly contactId?: string,
    public readonly organizationId?: string,
    public readonly quantity: number = 1,
    public readonly isInterState: boolean = false,
  ) {}
}
