export class UpdateQuotationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly title?: string,
    public readonly summary?: string,
    public readonly coverNote?: string,
    public readonly priceType?: string,
    public readonly minAmount?: number,
    public readonly maxAmount?: number,
    public readonly plusMinusPercent?: number,
    public readonly validFrom?: Date,
    public readonly validUntil?: Date,
    public readonly paymentTerms?: string,
    public readonly deliveryTerms?: string,
    public readonly warrantyTerms?: string,
    public readonly termsConditions?: string,
    public readonly discountType?: string,
    public readonly discountValue?: number,
    public readonly tags?: string[],
    public readonly internalNotes?: string,
  ) {}
}
