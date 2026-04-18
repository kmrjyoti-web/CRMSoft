export declare class AddLineItemDto {
    productId?: string;
    productName?: string;
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
