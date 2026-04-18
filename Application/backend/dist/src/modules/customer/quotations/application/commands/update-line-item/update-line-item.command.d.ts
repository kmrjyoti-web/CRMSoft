export declare class UpdateLineItemCommand {
    readonly quotationId: string;
    readonly itemId: string;
    readonly userId: string;
    readonly userName: string;
    readonly productName?: string | undefined;
    readonly description?: string | undefined;
    readonly quantity?: number | undefined;
    readonly unit?: string | undefined;
    readonly unitPrice?: number | undefined;
    readonly discountType?: string | undefined;
    readonly discountValue?: number | undefined;
    readonly gstRate?: number | undefined;
    readonly cessRate?: number | undefined;
    readonly isOptional?: boolean | undefined;
    readonly notes?: string | undefined;
    constructor(quotationId: string, itemId: string, userId: string, userName: string, productName?: string | undefined, description?: string | undefined, quantity?: number | undefined, unit?: string | undefined, unitPrice?: number | undefined, discountType?: string | undefined, discountValue?: number | undefined, gstRate?: number | undefined, cessRate?: number | undefined, isOptional?: boolean | undefined, notes?: string | undefined);
}
