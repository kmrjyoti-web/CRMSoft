// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export type QuotationStatus =
  | "DRAFT"
  | "INTERNAL_REVIEW"
  | "SENT"
  | "VIEWED"
  | "NEGOTIATION"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "REVISED"
  | "CANCELLED";

export type QuotationPriceType = "FIXED" | "RANGE" | "NEGOTIABLE";

export type DiscountType = "PERCENTAGE" | "FLAT";

export type SendChannel = "EMAIL" | "WHATSAPP" | "PORTAL" | "MANUAL" | "DOWNLOAD";

// ---------------------------------------------------------------------------
// Line Item
// ---------------------------------------------------------------------------

export interface LineItem {
  id: string;
  quotationId: string;
  productName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  mrp?: number;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  lineTotal: number;
  gstRate?: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessRate?: number;
  cessAmount: number;
  taxAmount: number;
  totalWithTax: number;
  sortOrder: number;
  isOptional: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Quotation
// ---------------------------------------------------------------------------

export interface QuotationItem {
  id: string;
  quotationNo: string;
  status: QuotationStatus;
  version: number;
  title?: string;
  summary?: string;
  coverNote?: string;
  subtotal: number;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
  priceType?: QuotationPriceType;
  minAmount?: number;
  maxAmount?: number;
  plusMinusPercent?: number;
  validFrom?: string;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  termsConditions?: string;
  tags?: string[];
  internalNotes?: string;
  parentQuotationId?: string;
  acceptedAt?: string;
  acceptedNote?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  leadId: string;
  contactPersonId?: string;
  organizationId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export interface QuotationLead {
  id: string;
  leadNumber: string;
  contact?: { id: string; firstName: string; lastName: string };
}

export interface QuotationCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SendLog {
  id: string;
  sentAt: string;
  channel: SendChannel;
  receiverName?: string;
  receiverEmail?: string;
  viewedAt?: string;
  viewCount: number;
}

// ---------------------------------------------------------------------------
// List / Detail variants
// ---------------------------------------------------------------------------

export interface QuotationListItem extends QuotationItem {
  lead?: QuotationLead;
  createdBy?: QuotationCreatedBy;
}

export interface QuotationDetail extends QuotationItem {
  lead?: QuotationLead;
  createdBy?: QuotationCreatedBy;
  lineItems?: LineItem[];
  sendLogs?: SendLog[];
}

// ---------------------------------------------------------------------------
// Create / Update DTOs
// ---------------------------------------------------------------------------

export interface LineItemCreateData {
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
  isOptional?: boolean;
  notes?: string;
  sortOrder?: number;
}

export interface LineItemUpdateData {
  productName?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  discountType?: string;
  discountValue?: number;
  gstRate?: number;
  cessRate?: number;
  isOptional?: boolean;
  notes?: string;
}

export interface QuotationCreateData {
  leadId: string;
  contactPersonId?: string;
  organizationId?: string;
  title?: string;
  summary?: string;
  coverNote?: string;
  priceType?: string;
  validFrom?: string;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  termsConditions?: string;
  discountType?: string;
  discountValue?: number;
  items?: LineItemCreateData[];
  tags?: string[];
  internalNotes?: string;
}

export interface QuotationUpdateData {
  title?: string;
  summary?: string;
  coverNote?: string;
  priceType?: string;
  validFrom?: string;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  termsConditions?: string;
  discountType?: string;
  discountValue?: number;
  tags?: string[];
  internalNotes?: string;
}

export interface SendQuotationData {
  channel: SendChannel;
  receiverContactId?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  message?: string;
}

export interface AcceptQuotationData {
  acceptedNote?: string;
}

export interface RejectQuotationData {
  rejectedReason: string;
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export interface QuotationListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  leadId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}
