// ─── Units ───
export interface UnitMaster {
  id: string;
  tenantId: string;
  name: string;
  symbol: string;
  unitCategory: string;
  isBase: boolean;
  isSystem: boolean;
  isActive: boolean;
}

export interface UnitConversion {
  id: string;
  tenantId: string;
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
  productId?: string;
}

// ─── RFQ ───
export interface PurchaseRFQ {
  id: string;
  tenantId: string;
  rfqNumber: string;
  title: string;
  description?: string;
  status: string;
  requiredByDate?: string;
  validUntilDate?: string;
  sentToVendorIds: string[];
  createdById: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseRFQItem[];
  _count?: { quotations: number };
}

export interface PurchaseRFQItem {
  id: string;
  rfqId: string;
  productId: string;
  quantity: number;
  unitId: string;
  specifications?: string;
}

// ─── Purchase Quotation ───
export interface PurchaseQuotation {
  id: string;
  tenantId: string;
  rfqId?: string;
  vendorId: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil?: string;
  status: string;
  creditDays?: number;
  deliveryDays?: number;
  subtotal?: number;
  taxAmount?: number;
  grandTotal?: number;
  compareScore?: number;
  remarks?: string;
  createdAt: string;
  rfq?: { id: string; rfqNumber: string };
  items: PurchaseQuotationItem[];
}

export interface PurchaseQuotationItem {
  id: string;
  quotationId: string;
  productId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
}

// ─── Compare ───
export interface QuotationComparison {
  id: string;
  tenantId: string;
  rfqId: string;
  compareBy: string;
  customWeights?: Record<string, number>;
  comparisonData: QuotationScore[];
  selectedQuotationId?: string;
  status: string;
  createdAt: string;
}

export interface QuotationScore {
  quotationId: string;
  vendorId: string;
  priceScore: number;
  deliveryScore: number;
  creditScore: number;
  qualityScore: number;
  totalScore: number;
  grandTotal: number;
  deliveryDays: number;
  creditDays: number;
}

// ─── Purchase Order ───
export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  vendorId: string;
  quotationId?: string;
  rfqId?: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  grandTotal: number;
  creditDays?: number;
  createdById: string;
  approvedById?: string;
  approvedAt?: string;
  remarks?: string;
  createdAt: string;
  items: PurchaseOrderItem[];
  _count?: { goodsReceipts: number; purchaseInvoices: number };
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  productId: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  rejectedQty: number;
  unitId: string;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
}

// ─── Goods Receipt ───
export interface GoodsReceipt {
  id: string;
  tenantId: string;
  receiptType: string;
  receiptNumber: string;
  vendorId?: string;
  poId?: string;
  locationId: string;
  status: string;
  receiptDate: string;
  vendorChallanNo?: string;
  inspectedById?: string;
  remarks?: string;
  createdAt: string;
  items: GoodsReceiptItem[];
  po?: { id: string; poNumber: string };
}

export interface GoodsReceiptItem {
  id: string;
  receiptId: string;
  productId: string;
  poItemId?: string;
  receivedQty: number;
  acceptedQty?: number;
  rejectedQty?: number;
  unitId: string;
  batchNo?: string;
  expiryDate?: string;
  locationId?: string;
  rejectionReason?: string;
}

// ─── Purchase Invoice ───
export interface PurchaseInvoice {
  id: string;
  tenantId: string;
  vendorInvoiceNo: string;
  ourReference: string;
  vendorId: string;
  poId?: string;
  goodsReceiptId?: string;
  status: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxableAmount: number;
  grandTotal: number;
  paymentStatus: string;
  paidAmount: number;
  balanceAmount: number;
  remarks?: string;
  createdAt: string;
  items: PurchaseInvoiceItem[];
  po?: { id: string; poNumber: string };
}

export interface PurchaseInvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  discount?: number;
  taxableAmount: number;
  totalAmount: number;
  hsnCode?: string;
}

// ─── Dashboard ───
export interface ProcurementDashboard {
  rfq: { total: number; draft: number; sent: number; closed: number };
  purchaseOrders: {
    total: number; draft: number; pendingApproval: number;
    approved: number; completed: number; totalValue: number;
  };
  goodsReceipts: { total: number; draft: number; accepted: number; rejected: number };
  invoices: {
    total: number; draft: number; pending: number;
    approved: number; paid: number; totalPayable: number;
  };
  recentPOs: Array<{
    id: string; poNumber: string; status: string;
    grandTotal: number; createdAt: string;
  }>;
  pendingApprovals: {
    purchaseOrders: Array<{ id: string; poNumber: string; grandTotal: number; createdAt: string }>;
    invoices: Array<{ id: string; ourReference: string; grandTotal: number; createdAt: string }>;
    totalCount: number;
  };
}
