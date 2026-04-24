import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  InventoryDashboard,
  SerialMaster,
  StockTransaction,
  StockLocation,
  StockAdjustment,
  StockSummary,
  InventoryLabel,
  LedgerEntry,
  ExpiryReportItem,
  ValuationReport,
  SerialTrackingItem,
  CreateSerialPayload,
  RecordTransactionPayload,
  TransferPayload,
  CreateLocationPayload,
  CreateAdjustmentPayload,
} from "../types/inventory.types";

const BASE = "/api/v1/inventory";

export const inventoryService = {
  // ─── Dashboard ───
  getDashboard: () =>
    api.get<ApiResponse<InventoryDashboard>>(`${BASE}/dashboard`).then((r) => r.data),

  // ─── Serials ───
  listSerials: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<SerialMaster[]>>(`${BASE}/serials`, { params }).then((r) => r.data),

  getSerial: (id: string) =>
    api.get<ApiResponse<SerialMaster>>(`${BASE}/serials/${id}`).then((r) => r.data),

  createSerial: (payload: CreateSerialPayload) =>
    api.post<ApiResponse<SerialMaster>>(`${BASE}/serials`, payload).then((r) => r.data),

  bulkCreateSerials: (items: CreateSerialPayload[]) =>
    api.post<ApiResponse<{ created: number; errors: any[]; total: number }>>(`${BASE}/serials/bulk`, { items }).then((r) => r.data),

  updateSerial: (id: string, payload: Partial<CreateSerialPayload>) =>
    api.patch<ApiResponse<SerialMaster>>(`${BASE}/serials/${id}`, payload).then((r) => r.data),

  changeSerialStatus: (id: string, status: string, customerId?: string, invoiceId?: string) =>
    api.patch<ApiResponse<SerialMaster>>(`${BASE}/serials/${id}/status`, { status, customerId, invoiceId }).then((r) => r.data),

  searchSerials: (q: string) =>
    api.get<ApiResponse<SerialMaster[]>>(`${BASE}/serials/search`, { params: { q } }).then((r) => r.data),

  getExpiringSerials: (days?: number) =>
    api.get<ApiResponse<SerialMaster[]>>(`${BASE}/serials/expiring`, { params: { days } }).then((r) => r.data),

  // ─── Transactions ───
  recordTransaction: (payload: RecordTransactionPayload) =>
    api.post<ApiResponse<StockTransaction>>(`${BASE}/transactions`, payload).then((r) => r.data),

  listTransactions: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<StockTransaction[]>>(`${BASE}/transactions`, { params }).then((r) => r.data),

  getLedger: (productId: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse<StockTransaction[]>>(`${BASE}/transactions/ledger/${productId}`, { params }).then((r) => r.data),

  getTransactionsBySerial: (serialId: string) =>
    api.get<ApiResponse<StockTransaction[]>>(`${BASE}/transactions/by-serial/${serialId}`).then((r) => r.data),

  transfer: (payload: TransferPayload) =>
    api.post<ApiResponse<any>>(`${BASE}/transactions/transfer`, payload).then((r) => r.data),

  // ─── Stock ───
  getStock: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<StockSummary[]>>(`${BASE}/stock`, { params }).then((r) => r.data),

  getOpeningBalance: (productId: string, date: string) =>
    api.get<ApiResponse<any>>(`${BASE}/stock/opening-balance`, { params: { productId, date } }).then((r) => r.data),

  recalculateStock: (productId: string) =>
    api.post<ApiResponse<any>>(`${BASE}/stock/recalculate`, { productId }).then((r) => r.data),

  // ─── Locations ───
  listLocations: () =>
    api.get<ApiResponse<StockLocation[]>>(`${BASE}/locations`).then((r) => r.data),

  createLocation: (payload: CreateLocationPayload) =>
    api.post<ApiResponse<StockLocation>>(`${BASE}/locations`, payload).then((r) => r.data),

  updateLocation: (id: string, payload: Partial<CreateLocationPayload>) =>
    api.patch<ApiResponse<StockLocation>>(`${BASE}/locations/${id}`, payload).then((r) => r.data),

  // ─── Reports ───
  stockLedgerReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<LedgerEntry[]>>(`${BASE}/reports/stock-ledger`, { params }).then((r) => r.data),

  expiryReport: (days?: number) =>
    api.get<ApiResponse<ExpiryReportItem[]>>(`${BASE}/reports/expiry`, { params: { days } }).then((r) => r.data),

  valuationReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ValuationReport>>(`${BASE}/reports/valuation`, { params }).then((r) => r.data),

  serialTrackingReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<SerialTrackingItem[]>>(`${BASE}/reports/serial-tracking`, { params }).then((r) => r.data),

  // ─── Adjustments ───
  createAdjustment: (payload: CreateAdjustmentPayload) =>
    api.post<ApiResponse<StockAdjustment>>(`${BASE}/adjustments`, payload).then((r) => r.data),

  approveAdjustment: (id: string, action: 'approve' | 'reject') =>
    api.patch<ApiResponse<StockAdjustment>>(`${BASE}/adjustments/${id}/approve`, { action }).then((r) => r.data),

  // ─── Labels ───
  getLabels: () =>
    api.get<ApiResponse<InventoryLabel[]>>("/api/v1/vendor/inventory-labels").then((r) => r.data),

  upsertLabel: (payload: Partial<InventoryLabel>) =>
    api.post<ApiResponse<InventoryLabel>>("/api/v1/vendor/inventory-labels", payload).then((r) => r.data),
};
