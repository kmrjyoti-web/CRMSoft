export declare class CreateLineItemDto {
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
export declare class CreateQuotationDto {
    leadId: string;
    contactPersonId?: string;
    organizationId?: string;
    title?: string;
    summary?: string;
    coverNote?: string;
    priceType?: string;
    minAmount?: number;
    maxAmount?: number;
    plusMinusPercent?: number;
    validFrom?: string;
    validUntil?: string;
    paymentTerms?: string;
    deliveryTerms?: string;
    warrantyTerms?: string;
    termsConditions?: string;
    discountType?: string;
    discountValue?: number;
    items?: CreateLineItemDto[];
    tags?: string[];
    internalNotes?: string;
}
