// ─── Enums ───

export type InventoryType = 'SERIAL' | 'BATCH' | 'EXPIRY' | 'BOM' | 'SIMPLE';
export type SerialStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'EXPIRED' | 'DAMAGED' | 'RETURNED' | 'ACTIVATED' | 'DEACTIVATED';
export type ExpiryType = 'FIXED_DATE' | 'DAYS' | 'MONTHS' | 'YEARS' | 'NEVER';
export type StockTransactionType = 'PURCHASE_IN' | 'SALE_OUT' | 'RETURN_IN' | 'TRANSFER' | 'ADJUSTMENT' | 'OPENING_BALANCE' | 'DAMAGE' | 'WRITE_OFF' | 'PRODUCTION_IN' | 'PRODUCTION_OUT' | 'SCRAP';
export type AdjustmentStatusType = 'ADJ_PENDING' | 'ADJ_APPROVED' | 'ADJ_REJECTED';

// ─── Models ───

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  inventoryType: InventoryType;
  currentStock: number;
  reservedStock: number;
  minStockLevel: number | null;
  reorderLevel: number | null;
  maxStockLevel: number | null;
  avgCostPrice: number | null;
  lastPurchasePrice: number | null;
  sellingPrice: number | null;
  taxType: string | null;
  taxRate: number | null;
  hsnCode: string | null;
  isRawMaterial: boolean;
  isFinishedProduct: boolean;
  isScrap: boolean;
  defaultUnit: string | null;
  industryCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerialMaster {
  id: string;
  tenantId: string;
  productId: string;
  inventoryItemId: string;
  serialNo: string;
  code1: string | null;
  code2: string | null;
  batchNo: string | null;
  status: SerialStatus;
  expiryType: ExpiryType;
  expiryValue: number | null;
  expiryDate: string | null;
  createDate: string;
  activationDate: string | null;
  soldDate: string | null;
  mrp: number | null;
  purchaseRate: number | null;
  saleRate: number | null;
  costPrice: number | null;
  taxType: string | null;
  taxRate: number | null;
  hsnCode: string | null;
  locationId: string | null;
  customerId: string | null;
  invoiceId: string | null;
  customFields: any;
  metadata: any;
  industryCode: string | null;
  inventoryItem?: InventoryItem;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  tenantId: string;
  inventoryItemId: string;
  productId: string;
  transactionType: StockTransactionType;
  quantity: number;
  unitPrice: number | null;
  totalAmount: number | null;
  locationId: string;
  toLocationId: string | null;
  serialMasterId: string | null;
  batchId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  transactionDate: string;
  remarks: string | null;
  createdById: string | null;
  createdAt: string;
  runningBalance?: number;
}

export interface StockLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  contactPerson: string | null;
  phone: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface StockAdjustment {
  id: string;
  tenantId: string;
  productId: string;
  locationId: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
  approvedById: string | null;
  approvedAt: string | null;
  status: AdjustmentStatusType;
  createdById: string;
  createdAt: string;
}

export interface StockSummary {
  id: string;
  tenantId: string;
  productId: string;
  locationId: string;
  inventoryItemId: string;
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  currentStock: number;
  reservedStock: number;
  avgCostPrice: number | null;
  lastUpdatedAt: string;
  inventoryItem?: InventoryItem;
}

export interface InventoryLabel {
  id: string;
  industryCode: string;
  serialNoLabel: string;
  code1Label: string | null;
  code2Label: string | null;
  expiryLabel: string | null;
  stockInLabel: string | null;
  stockOutLabel: string | null;
  locationLabel: string | null;
}

// ─── Dashboard ───

export interface InventoryDashboard {
  totalStock: number;
  totalProducts: number;
  totalSerials: number;
  stockValue: number;
  expiringSoon: number;
  lowStockAlerts: number;
}

// ─── Reports ───

export interface LedgerEntry {
  id: string;
  date: string;
  productId: string;
  type: string;
  inQty: number;
  outQty: number;
  balance: number;
  unitPrice: number | null;
  totalAmount: number | null;
  location: string;
  remarks: string | null;
}

export interface ExpiryReportItem {
  id: string;
  serialNo: string;
  productId: string;
  expiryDate: string | null;
  daysLeft: number | null;
  status: string;
  isExpired: boolean;
  locationId: string | null;
  costPrice: number | null;
}

export interface ValuationReport {
  totalValue: number;
  totalStock: number;
  totalProducts: number;
  products: Array<{
    productId: string;
    inventoryType: string;
    currentStock: number;
    avgCostPrice: number;
    totalValue: number;
    hsnCode: string | null;
  }>;
}

export interface SerialTrackingItem extends SerialMaster {
  lifecycle: StockTransaction[];
}

// ─── DTOs ───

export interface CreateSerialPayload {
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
  customFields?: any;
  industryCode?: string;
}

export interface RecordTransactionPayload {
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

export interface TransferPayload {
  productId: string;
  quantity: number;
  fromLocationId: string;
  toLocationId: string;
  unitPrice?: number;
  remarks?: string;
}

export interface CreateLocationPayload {
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

export interface CreateAdjustmentPayload {
  productId: string;
  locationId: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
}
