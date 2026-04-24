export class AddLineItemCommand {
  constructor(
    public readonly quotationId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly productId?: string,
    public readonly productName?: string,
    public readonly description?: string,
    public readonly quantity?: number,
    public readonly unit?: string,
    public readonly unitPrice?: number,
    public readonly mrp?: number,
    public readonly discountType?: string,
    public readonly discountValue?: number,
    public readonly gstRate?: number,
    public readonly cessRate?: number,
    public readonly isOptional?: boolean,
    public readonly notes?: string,
  ) {}
}
