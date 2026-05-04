// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "VOID";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "CASH"
  | "CHEQUE"
  | "BANK_TRANSFER"
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "NET_BANKING"
  | "WALLET"
  | "RAZORPAY"
  | "STRIPE"
  | "OTHER";

export type PaymentGateway = "RAZORPAY" | "STRIPE" | "MANUAL";

export type RefundStatus =
  | "REFUND_PENDING"
  | "REFUND_PROCESSED"
  | "REFUND_FAILED"
  | "REFUND_CANCELLED";

export type CreditNoteStatus =
  | "CN_DRAFT"
  | "CN_ISSUED"
  | "CN_APPLIED"
  | "CN_CANCELLED";

// ---------------------------------------------------------------------------
// Invoice Line Item
// ---------------------------------------------------------------------------

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  quotationId?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  // Billing
  billingName: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  billingGstNumber?: string;
  // Shipping
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  // Seller snapshot
  sellerName: string;
  sellerAddress?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerPincode?: string;
  sellerGstNumber?: string;
  sellerPanNumber?: string;
  // Dates
  invoiceDate: string;
  dueDate: string;
  supplyDate?: string;
  // Pricing
  subtotal: number;
  discountType?: string;
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
  amountInWords?: string;
  // Payment tracking
  paidAmount: number;
  balanceAmount: number;
  isInterState: boolean;
  // Bank
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  // Notes
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
  // Audit
  createdById: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledById?: string;
  cancelReason?: string;
}

// ---------------------------------------------------------------------------
// Invoice Relations
// ---------------------------------------------------------------------------

export interface InvoiceContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InvoiceOrganization {
  id: string;
  name: string;
}

export interface InvoiceLead {
  id: string;
  leadNumber: string;
}

export interface InvoiceCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
}

// ---------------------------------------------------------------------------
// Invoice List / Detail
// ---------------------------------------------------------------------------

export interface InvoiceListItem extends InvoiceItem {
  contact?: InvoiceContact;
  organization?: InvoiceOrganization;
  lead?: InvoiceLead;
}

export interface InvoiceDetail extends InvoiceItem {
  contact?: InvoiceContact;
  organization?: InvoiceOrganization;
  lead?: InvoiceLead;
  createdBy?: InvoiceCreatedBy;
  lineItems?: InvoiceLineItem[];
  payments?: PaymentItem[];
  creditNotes?: CreditNote[];
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export interface PaymentItem {
  id: string;
  paymentNo: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  gateway: PaymentGateway;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  chequeNumber?: string;
  chequeDate?: string;
  chequeBankName?: string;
  transactionRef?: string;
  upiTransactionId?: string;
  paidAt?: string;
  notes?: string;
  failureReason?: string;
  recordedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInvoice {
  id: string;
  invoiceNo: string;
  billingName: string;
}

export interface PaymentListItem extends PaymentItem {
  invoice?: PaymentInvoice;
}

export interface PaymentDetail extends PaymentItem {
  invoice?: PaymentInvoice;
  receipt?: PaymentReceipt;
  refunds?: Refund[];
}

// ---------------------------------------------------------------------------
// Payment Receipt
// ---------------------------------------------------------------------------

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  paymentId: string;
  amount: number;
  amountInWords?: string;
  receivedFrom: string;
  paidFor: string;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  generatedById: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Refund
// ---------------------------------------------------------------------------

export interface Refund {
  id: string;
  refundNo: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  gatewayRefundId?: string;
  processedAt?: string;
  processedById?: string;
  failureReason?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Credit Note
// ---------------------------------------------------------------------------

export interface CreditNote {
  id: string;
  creditNoteNo: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: CreditNoteStatus;
  appliedToInvoiceId?: string;
  appliedAmount?: number;
  appliedAt?: string;
  issuedAt?: string;
  issuedById?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Create / Update DTOs
// ---------------------------------------------------------------------------

export interface InvoiceLineItemCreateData {
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

export interface InvoiceCreateData {
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
  lineItems: InvoiceLineItemCreateData[];
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
}

export interface InvoiceUpdateData {
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

export interface GenerateInvoiceData {
  quotationId: string;
  dueDate: string;
  isInterState?: boolean;
  notes?: string;
  termsAndConditions?: string;
}

export interface CancelInvoiceData {
  reason: string;
}

export interface RecordPaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  gateway?: PaymentGateway;
  chequeNumber?: string;
  chequeDate?: string;
  chequeBankName?: string;
  transactionRef?: string;
  upiTransactionId?: string;
  notes?: string;
}

export interface CreateRefundData {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface CreateCreditNoteData {
  invoiceId: string;
  amount: number;
  reason: string;
}

export interface ApplyCreditNoteData {
  applyToInvoiceId: string;
  amount?: number;
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  status?: string;
  contactId?: string;
  organizationId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  invoiceId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}
