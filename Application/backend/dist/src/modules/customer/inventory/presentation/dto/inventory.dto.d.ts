export declare class CreateSerialDto {
    productId: string;
    serialNo: string;
    code1?: string;
    code2?: string;
    batchNo?: string;
    expiryType?: string;
    expiryValue?: number;
    expiryDate?: string;
    mrp?: number;
    purchaseRate?: number;
    saleRate?: number;
    costPrice?: number;
    taxType?: string;
    taxRate?: number;
    hsnCode?: string;
    locationId?: string;
    customFields?: Record<string, unknown>;
    industryCode?: string;
}
export declare class BulkCreateSerialDto {
    items: CreateSerialDto[];
}
export declare class UpdateSerialDto {
    code1?: string;
    code2?: string;
    batchNo?: string;
    expiryType?: string;
    expiryValue?: number;
    expiryDate?: string;
    mrp?: number;
    purchaseRate?: number;
    saleRate?: number;
    costPrice?: number;
    taxType?: string;
    taxRate?: number;
    hsnCode?: string;
    locationId?: string;
    customFields?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export declare class ChangeStatusDto {
    status: string;
    customerId?: string;
    invoiceId?: string;
}
export declare class RecordTransactionDto {
    productId: string;
    transactionType: string;
    quantity: number;
    locationId: string;
    toLocationId?: string;
    unitPrice?: number;
    serialMasterId?: string;
    batchId?: string;
    referenceType?: string;
    referenceId?: string;
    remarks?: string;
}
export declare class TransferDto {
    productId: string;
    quantity: number;
    fromLocationId: string;
    toLocationId: string;
    unitPrice?: number;
    remarks?: string;
}
export declare class CreateLocationDto {
    name: string;
    code: string;
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPerson?: string;
    phone?: string;
    isDefault?: boolean;
}
export declare class UpdateLocationDto {
    name?: string;
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactPerson?: string;
    phone?: string;
    isDefault?: boolean;
    isActive?: boolean;
}
export declare class CreateAdjustmentDto {
    productId: string;
    locationId: string;
    adjustmentType: string;
    quantity: number;
    reason: string;
}
export declare class ApproveAdjustmentDto {
    action: 'approve' | 'reject';
}
export declare class UpsertLabelDto {
    industryCode: string;
    serialNoLabel?: string;
    code1Label?: string;
    code2Label?: string;
    expiryLabel?: string;
    stockInLabel?: string;
    stockOutLabel?: string;
    locationLabel?: string;
}
