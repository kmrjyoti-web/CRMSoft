export declare class CreateQuotationCommand {
    readonly userId: string;
    readonly userName: string;
    readonly tenantId: string;
    readonly leadId: string;
    readonly contactPersonId?: string | undefined;
    readonly organizationId?: string | undefined;
    readonly title?: string | undefined;
    readonly summary?: string | undefined;
    readonly coverNote?: string | undefined;
    readonly priceType?: string | undefined;
    readonly minAmount?: number | undefined;
    readonly maxAmount?: number | undefined;
    readonly plusMinusPercent?: number | undefined;
    readonly validFrom?: Date | undefined;
    readonly validUntil?: Date | undefined;
    readonly paymentTerms?: string | undefined;
    readonly deliveryTerms?: string | undefined;
    readonly warrantyTerms?: string | undefined;
    readonly termsConditions?: string | undefined;
    readonly discountType?: string | undefined;
    readonly discountValue?: number | undefined;
    readonly items?: CreateLineItemInput[] | undefined;
    readonly tags?: string[] | undefined;
    readonly internalNotes?: string | undefined;
    constructor(userId: string, userName: string, tenantId: string, leadId: string, contactPersonId?: string | undefined, organizationId?: string | undefined, title?: string | undefined, summary?: string | undefined, coverNote?: string | undefined, priceType?: string | undefined, minAmount?: number | undefined, maxAmount?: number | undefined, plusMinusPercent?: number | undefined, validFrom?: Date | undefined, validUntil?: Date | undefined, paymentTerms?: string | undefined, deliveryTerms?: string | undefined, warrantyTerms?: string | undefined, termsConditions?: string | undefined, discountType?: string | undefined, discountValue?: number | undefined, items?: CreateLineItemInput[] | undefined, tags?: string[] | undefined, internalNotes?: string | undefined);
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
