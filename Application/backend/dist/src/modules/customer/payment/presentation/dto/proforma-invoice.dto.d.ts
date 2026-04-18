import { ProformaInvoiceStatus } from '@prisma/working-client';
export declare class ProformaLineItemDto {
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
export declare class CreateProformaInvoiceDto {
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
    proformaDate?: string;
    validUntil?: string;
    discountType?: string;
    discountValue?: number;
    isInterState?: boolean;
    lineItems: ProformaLineItemDto[];
    notes?: string;
    termsAndConditions?: string;
    internalNotes?: string;
}
export declare class UpdateProformaInvoiceDto {
    billingName?: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPincode?: string;
    billingGstNumber?: string;
    validUntil?: string;
    notes?: string;
    termsAndConditions?: string;
    internalNotes?: string;
}
export declare class GenerateProformaFromQuotationDto {
    quotationId: string;
    validUntil?: string;
    isInterState?: boolean;
    notes?: string;
    termsAndConditions?: string;
}
export declare class ProformaInvoiceQueryDto {
    status?: ProformaInvoiceStatus;
    contactId?: string;
    organizationId?: string;
    leadId?: string;
    quotationId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
export declare class CancelProformaDto {
    reason: string;
}
