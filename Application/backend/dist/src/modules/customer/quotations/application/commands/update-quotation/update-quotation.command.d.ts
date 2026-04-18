export declare class UpdateQuotationCommand {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
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
    readonly tags?: string[] | undefined;
    readonly internalNotes?: string | undefined;
    constructor(id: string, userId: string, userName: string, title?: string | undefined, summary?: string | undefined, coverNote?: string | undefined, priceType?: string | undefined, minAmount?: number | undefined, maxAmount?: number | undefined, plusMinusPercent?: number | undefined, validFrom?: Date | undefined, validUntil?: Date | undefined, paymentTerms?: string | undefined, deliveryTerms?: string | undefined, warrantyTerms?: string | undefined, termsConditions?: string | undefined, discountType?: string | undefined, discountValue?: number | undefined, tags?: string[] | undefined, internalNotes?: string | undefined);
}
