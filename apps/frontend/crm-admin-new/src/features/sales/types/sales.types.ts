export interface SaleOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerType: string;
  status: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryLocationId?: string;
  subtotal: number;
  discountAmount?: number;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  roundOff?: number;
  grandTotal: number;
  completionPercent: number;
  creditDays?: number;
  paymentTerms?: string;
  createdById: string;
  approvedById?: string;
  approvedAt?: string;
  remarks?: string;
  createdAt: string;
  items?: SaleOrderItem[];
  deliveryChallans?: DeliveryChallan[];
}

export interface SaleOrderItem {
  id: string;
  productId: string;
  orderedQty: number;
  deliveredQty: number;
  pendingQty: number;
  returnedQty: number;
  unitId: string;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxType?: string;
  taxAmount?: number;
  hsnCode?: string;
  totalAmount: number;
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  saleOrderId?: string;
  customerId: string;
  customerType: string;
  status: string;
  dispatchDate?: string;
  deliveryDate?: string;
  fromLocationId: string;
  transporterName?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  ewayBillNumber?: string;
  ewayBillDate?: string;
  totalAmount?: number;
  inventoryUpdated: boolean;
  createdById: string;
  remarks?: string;
  createdAt: string;
  items?: DeliveryChallanItem[];
}

export interface DeliveryChallanItem {
  id: string;
  productId: string;
  saleOrderItemId?: string;
  quantity: number;
  unitId: string;
  unitPrice?: number;
  batchNo?: string;
  serialNos?: string[];
  fromLocationId?: string;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  customerId: string;
  customerType: string;
  saleOrderId?: string;
  invoiceId?: string;
  status: string;
  returnDate: string;
  returnReason: string;
  receiveLocationId?: string;
  subtotal: number;
  taxAmount?: number;
  grandTotal: number;
  inventoryUpdated: boolean;
  creditNoteId?: string;
  createdById: string;
  remarks?: string;
  createdAt: string;
  items?: SaleReturnItem[];
}

export interface SaleReturnItem {
  id: string;
  productId: string;
  returnedQty: number;
  acceptedQty?: number;
  rejectedQty?: number;
  unitId: string;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  hsnCode?: string;
  returnReason?: string;
  condition?: string;
  batchNo?: string;
}

export interface SalesCreditNote {
  id: string;
  creditNoteNo: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: string;
  appliedToInvoiceId?: string;
  appliedAmount?: number;
  appliedAt?: string;
  issuedAt?: string;
  issuedById?: string;
  createdById: string;
  createdAt: string;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  vendorId: string;
  purchaseInvoiceId?: string;
  goodsReceiptId?: string;
  reason: string;
  status: string;
  noteDate: string;
  subtotal: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal: number;
  inventoryEffect: boolean;
  accountsEffect: boolean;
  createdById: string;
  createdAt: string;
  items?: DebitNoteItem[];
}

export interface DebitNoteItem {
  id: string;
  productId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  hsnCode?: string;
  totalAmount: number;
}

// Payloads
export interface CreateSaleOrderPayload {
  quotationId?: string;
  customerId: string;
  customerType: string;
  expectedDeliveryDate?: string;
  deliveryLocationId?: string;
  creditDays?: number;
  paymentTerms?: string;
  remarks?: string;
  items: Array<{
    productId: string;
    orderedQty: number;
    unitId: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    taxType?: string;
    hsnCode?: string;
  }>;
}

export interface CreateDeliveryChallanPayload {
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
  items: Array<{
    productId: string;
    saleOrderItemId?: string;
    quantity: number;
    unitId: string;
    unitPrice?: number;
    batchNo?: string;
    serialNos?: string[];
    fromLocationId?: string;
  }>;
}

export interface CreateSaleReturnPayload {
  customerId: string;
  customerType: string;
  saleOrderId?: string;
  invoiceId?: string;
  returnReason: string;
  receiveLocationId?: string;
  remarks?: string;
  items: Array<{
    productId: string;
    returnedQty: number;
    unitId: string;
    unitPrice: number;
    taxRate?: number;
    hsnCode?: string;
    returnReason?: string;
    condition?: string;
  }>;
}

export interface CreateDebitNotePayload {
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
