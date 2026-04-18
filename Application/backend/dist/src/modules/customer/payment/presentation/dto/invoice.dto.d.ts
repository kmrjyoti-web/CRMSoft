import { InvoiceStatus } from '@prisma/working-client';
export declare class InvoiceLineItemDto {
    productId?: string;
    productCode?: string;
    productName: string;
    description?: string;
    hsnCode?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    mrp?: number;
    discountType?: string;
    discountValue?: number;
    gstRate?: number;
    cessRate?: number;
    sortOrder?: number;
    notes?: string;
}
export declare class CreateInvoiceDto {
    quotationId?: string;
    leadId?: string;
    contactId?: string;
    organizationId?: string;
    billingName: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPincode?: string;
    billingGstNumber?: string;
    shippingName?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPincode?: string;
    dueDate: string;
    invoiceDate?: string;
    supplyDate?: string;
    discountType?: string;
    discountValue?: number;
    isInterState?: boolean;
    lineItems: InvoiceLineItemDto[];
    notes?: string;
    termsAndConditions?: string;
    internalNotes?: string;
}
export declare class UpdateInvoiceDto {
    billingName?: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPincode?: string;
    billingGstNumber?: string;
    shippingName?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPincode?: string;
    dueDate?: string;
    notes?: string;
    termsAndConditions?: string;
    internalNotes?: string;
}
export declare class InvoiceQueryDto {
    status?: InvoiceStatus;
    leadId?: string;
    contactId?: string;
    organizationId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export declare class GenerateInvoiceDto {
    quotationId: string;
    dueDate: string;
    isInterState?: boolean;
    notes?: string;
    termsAndConditions?: string;
}
export declare class CancelInvoiceDto {
    reason: string;
}
