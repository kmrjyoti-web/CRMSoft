export class CreateQuotationCommand {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly tenantId: string,
    public readonly leadId: string,
    public readonly contactPersonId?: string,
    public readonly organizationId?: string,
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
    public readonly items?: CreateLineItemInput[],
    public readonly tags?: string[],
    public readonly internalNotes?: string,
  ) {}
}

export interface CreateLineItemInput {
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  mrp?: number;
  discountType?: string;
  discountValue?: number;
  gstRate?: number;
  cessRate?: number;
  isOptional?: boolean;
  notes?: string;
}
