declare class SaleOrderItemDto {
    productId: string;
    orderedQty: number;
    unitId: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    taxType?: string;
    hsnCode?: string;
}
export declare class CreateSaleOrderDto {
    quotationId?: string;
    customerId: string;
    customerType: string;
    expectedDeliveryDate?: string;
    deliveryLocationId?: string;
    creditDays?: number;
    paymentTerms?: string;
    remarks?: string;
    items: SaleOrderItemDto[];
}
export declare class UpdateSaleOrderDto {
    expectedDeliveryDate?: string;
    deliveryLocationId?: string;
    creditDays?: number;
    paymentTerms?: string;
    remarks?: string;
    items?: SaleOrderItemDto[];
}
declare class DeliveryChallanItemDto {
    productId: string;
    saleOrderItemId?: string;
    quantity: number;
    unitId: string;
    unitPrice?: number;
    batchNo?: string;
    serialNos?: string[];
    fromLocationId?: string;
}
export declare class CreateDeliveryChallanDto {
    saleOrderId?: string;
    customerId: string;
    customerType: string;
    fromLocationId: string;
    transporterName?: string;
    vehicleNumber?: string;
    lrNumber?: string;
    ewayBillNumber?: string;
    ewayBillDate?: string;
    remarks?: string;
    items: DeliveryChallanItemDto[];
}
declare class SaleReturnItemDto {
    productId: string;
    returnedQty: number;
    unitId: string;
    unitPrice: number;
    taxRate?: number;
    hsnCode?: string;
    returnReason?: string;
    condition?: string;
    batchNo?: string;
    serialNos?: string[];
}
export declare class CreateSaleReturnDto {
    customerId: string;
    customerType: string;
    saleOrderId?: string;
    invoiceId?: string;
    returnReason: string;
    receiveLocationId?: string;
    remarks?: string;
    items: SaleReturnItemDto[];
}
export declare class InspectReturnDto {
    inspections: Array<{
        itemId: string;
        acceptedQty: number;
        rejectedQty: number;
        condition?: string;
    }>;
}
export declare class CreateCreditNoteDto {
    customerId: string;
    customerType: string;
    invoiceId?: string;
    saleReturnId?: string;
    reason: string;
    items: Array<{
        productId: string;
        quantity: number;
        unitId: string;
        unitPrice: number;
        taxableAmount: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        hsnCode?: string;
    }>;
}
export declare class CreateDebitNoteDto {
    vendorId: string;
    purchaseInvoiceId?: string;
    goodsReceiptId?: string;
    reason: string;
    inventoryEffect?: boolean;
    accountsEffect?: boolean;
    items: Array<{
        productId: string;
        quantity: number;
        unitId: string;
        unitPrice: number;
        taxableAmount: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        hsnCode?: string;
    }>;
}
export declare class AdjustNoteDto {
    invoiceId?: string;
    issueRefund?: boolean;
}
export {};
