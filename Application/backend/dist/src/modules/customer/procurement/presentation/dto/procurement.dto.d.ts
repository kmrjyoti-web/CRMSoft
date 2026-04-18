export declare class CreateUnitDto {
    name: string;
    symbol: string;
    category: string;
    baseMultiplier?: number;
    isBaseUnit?: boolean;
}
export declare class UpdateUnitDto {
    name?: string;
    symbol?: string;
    baseMultiplier?: number;
}
export declare class CreateUnitConversionDto {
    fromUnitId: string;
    toUnitId: string;
    factor: number;
    productId?: string;
}
export declare class CalculateConversionDto {
    fromUnitId: string;
    toUnitId: string;
    quantity: number;
    productId?: string;
}
export declare class CreateRFQItemDto {
    productId: string;
    quantity: number;
    unitId?: string;
    specifications?: string;
}
export declare class CreateRFQDto {
    rfqNumber: string;
    dueDate?: string;
    notes?: string;
    items: CreateRFQItemDto[];
    vendorIds?: string[];
}
export declare class UpdateRFQDto {
    dueDate?: string;
    notes?: string;
    status?: string;
}
export declare class CreatePurchaseQuotationItemDto {
    rfqItemId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    unitId?: string;
    deliveryDays?: number;
}
export declare class CreatePurchaseQuotationDto {
    rfqId: string;
    vendorId: string;
    quotationNumber: string;
    validUntil?: string;
    paymentTermDays?: number;
    notes?: string;
    items: CreatePurchaseQuotationItemDto[];
}
export declare class CompareQuotationsDto {
    rfqId: string;
    priceWeight?: number;
    deliveryWeight?: number;
    creditWeight?: number;
    qualityWeight?: number;
}
export declare class SelectWinnerDto {
    comparisonId: string;
    quotationId: string;
    remarks?: string;
}
export declare class CreatePOItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    unitId?: string;
    expectedDeliveryDate?: string;
}
export declare class CreatePODto {
    poNumber: string;
    vendorId: string;
    quotationId?: string;
    expectedDate?: string;
    paymentTermDays?: number;
    deliveryAddress?: string;
    notes?: string;
    items: CreatePOItemDto[];
}
export declare class UpdatePODto {
    expectedDate?: string;
    deliveryAddress?: string;
    notes?: string;
    status?: string;
}
export declare class CreateGRNItemDto {
    poItemId: string;
    productId: string;
    receivedQty: number;
    acceptedQty?: number;
    rejectedQty?: number;
    rejectionReason?: string;
    locationId?: string;
    batchNo?: string;
    expiryDate?: string;
}
export declare class CreateGRNDto {
    grnNumber: string;
    purchaseOrderId: string;
    challanNumber?: string;
    challanDate?: string;
    vehicleNumber?: string;
    receivingLocationId?: string;
    notes?: string;
    items: CreateGRNItemDto[];
}
export declare class UpdateGRNDto {
    status?: string;
    notes?: string;
}
export declare class CreatePurchaseInvoiceItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    grnItemId?: string;
}
export declare class CreatePurchaseInvoiceDto {
    invoiceNumber: string;
    vendorId: string;
    purchaseOrderId?: string;
    goodsReceiptId?: string;
    vendorInvoiceNo: string;
    vendorInvoiceDate?: string;
    dueDate?: string;
    notes?: string;
    items: CreatePurchaseInvoiceItemDto[];
}
export declare class UpdatePurchaseInvoiceDto {
    status?: string;
    notes?: string;
}
export declare class WorkflowActionDto {
    action: 'submit' | 'approve' | 'reject' | 'cancel';
    remarks?: string;
}
