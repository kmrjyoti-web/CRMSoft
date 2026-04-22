// ── Enums ─────────────────────────────────────────────────

export type ProformaInvoiceStatus =
  | "PI_DRAFT"
  | "PI_SENT"
  | "PI_ACCEPTED"
  | "PI_REJECTED"
  | "PI_CONVERTED"
  | "PI_CANCELLED";

// ── Line Item ─────────────────────────────────────────────

export interface ProformaLineItem {
  id: string;
  tenantId: string;
  proformaInvoiceId: string;
  productId?: string | null;
  productCode?: string | null;
  productName: string;
  description?: string | null;
  hsnCode?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  mrp?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount: number;
  lineTotal: number;
  gstRate?: number | null;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessRate?: number | null;
  cessAmount: number;
  taxAmount: number;
  totalWithTax: number;
  sortOrder: number;
  notes?: string | null;
}

// ── List Item ─────────────────────────────────────────────

export interface ProformaListItem {
  id: string;
  tenantId: string;
  proformaNo: string;
  status: ProformaInvoiceStatus;
  quotationId?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  billingName: string;
  totalAmount: number;
  proformaDate?: string | null;
  validUntil?: string | null;
  invoiceId?: string | null;
  isInterState: boolean;
  createdAt: string;
  updatedAt: string;
  lineItems?: ProformaLineItem[];
}

// ── Detail ────────────────────────────────────────────────

export interface ProformaDetail extends ProformaListItem {
  billingAddress?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPincode?: string | null;
  billingGstNumber?: string | null;
  sellerName: string;
  sellerAddress?: string | null;
  sellerCity?: string | null;
  sellerState?: string | null;
  sellerPincode?: string | null;
  sellerGstNumber?: string | null;
  sellerPanNumber?: string | null;
  subtotal: number;
  discountType?: string | null;
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalTax: number;
  roundOff: number;
  amountInWords?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  internalNotes?: string | null;
  createdById: string;
  cancelledAt?: string | null;
  cancelledById?: string | null;
  cancelReason?: string | null;
  lineItems: ProformaLineItem[];
}

// ── Mutations ─────────────────────────────────────────────

export interface ProformaCreateData {
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
  lineItems: {
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
  }[];
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
}

export interface ProformaUpdateData {
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

export interface GenerateProformaData {
  quotationId: string;
  validUntil?: string;
  isInterState?: boolean;
  notes?: string;
  termsAndConditions?: string;
}

export interface CancelProformaData {
  reason: string;
}

// ── Query Params ──────────────────────────────────────────

export interface ProformaListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ProformaInvoiceStatus;
  leadId?: string;
  quotationId?: string;
  contactId?: string;
  organizationId?: string;
  [key: string]: unknown;
}
