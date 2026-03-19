import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  UnitMaster, UnitConversion,
  PurchaseRFQ, PurchaseQuotation, QuotationComparison,
  PurchaseOrder, GoodsReceipt, PurchaseInvoice,
  ProcurementDashboard,
} from "../types/procurement.types";

const BASE = "/api/v1/procurement";

export const procurementService = {
  // ─── Dashboard ───
  getDashboard: () =>
    api.get<ApiResponse<ProcurementDashboard>>(`${BASE}/dashboard`).then((r) => r.data),

  // ─── Units ───
  listUnits: (category?: string) =>
    api.get<ApiResponse<UnitMaster[]>>(`${BASE}/units`, { params: { category } }).then((r) => r.data),
  getUnit: (id: string) =>
    api.get<ApiResponse<UnitMaster>>(`${BASE}/units/${id}`).then((r) => r.data),
  createUnit: (data: Record<string, unknown>) =>
    api.post<ApiResponse<UnitMaster>>(`${BASE}/units`, data).then((r) => r.data),
  updateUnit: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<UnitMaster>>(`${BASE}/units/${id}`, data).then((r) => r.data),
  deleteUnit: (id: string) =>
    api.delete<ApiResponse<void>>(`${BASE}/units/${id}`).then((r) => r.data),

  // ─── Unit Conversions ───
  listConversions: (productId?: string) =>
    api.get<ApiResponse<UnitConversion[]>>(`${BASE}/unit-conversions`, { params: { productId } }).then((r) => r.data),
  createConversion: (data: Record<string, unknown>) =>
    api.post<ApiResponse<UnitConversion>>(`${BASE}/unit-conversions`, data).then((r) => r.data),
  deleteConversion: (id: string) =>
    api.delete<ApiResponse<void>>(`${BASE}/unit-conversions/${id}`).then((r) => r.data),
  calculateConversion: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ result: number; factor: number }>>(`${BASE}/unit-conversions/calculate`, data).then((r) => r.data),

  // ─── RFQ ───
  listRFQ: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PurchaseRFQ[]>>(`${BASE}/rfq`, { params }).then((r) => r.data),
  getRFQ: (id: string) =>
    api.get<ApiResponse<PurchaseRFQ>>(`${BASE}/rfq/${id}`).then((r) => r.data),
  createRFQ: (data: Record<string, unknown>) =>
    api.post<ApiResponse<PurchaseRFQ>>(`${BASE}/rfq`, data).then((r) => r.data),
  updateRFQ: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<PurchaseRFQ>>(`${BASE}/rfq/${id}`, data).then((r) => r.data),
  sendRFQ: (id: string, vendorIds: string[]) =>
    api.post<ApiResponse<PurchaseRFQ>>(`${BASE}/rfq/${id}/send`, { vendorIds }).then((r) => r.data),
  closeRFQ: (id: string) =>
    api.post<ApiResponse<PurchaseRFQ>>(`${BASE}/rfq/${id}/close`).then((r) => r.data),
  generateRFQNumber: () =>
    api.get<ApiResponse<{ number: string }>>(`${BASE}/rfq/generate-number`).then((r) => r.data),

  // ─── Quotations ───
  listQuotations: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PurchaseQuotation[]>>(`${BASE}/quotations`, { params }).then((r) => r.data),
  getQuotation: (id: string) =>
    api.get<ApiResponse<PurchaseQuotation>>(`${BASE}/quotations/${id}`).then((r) => r.data),
  createQuotation: (data: Record<string, unknown>) =>
    api.post<ApiResponse<PurchaseQuotation>>(`${BASE}/quotations`, data).then((r) => r.data),
  updateQuotation: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<PurchaseQuotation>>(`${BASE}/quotations/${id}`, data).then((r) => r.data),
  generateQuotationNumber: () =>
    api.get<ApiResponse<{ number: string }>>(`${BASE}/quotations/generate-number`).then((r) => r.data),

  // ─── Compare ───
  compareQuotations: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ comparison: QuotationComparison; scores: Record<string, unknown>[]; weights: Record<string, unknown> }>>(`${BASE}/compare`, data).then((r) => r.data),
  getComparison: (id: string) =>
    api.get<ApiResponse<QuotationComparison>>(`${BASE}/compare/${id}`).then((r) => r.data),
  listComparisons: (rfqId: string) =>
    api.get<ApiResponse<QuotationComparison[]>>(`${BASE}/compare/rfq/${rfqId}`).then((r) => r.data),
  selectWinner: (data: { comparisonId: string; quotationId: string; remarks?: string }) =>
    api.post<ApiResponse<QuotationComparison>>(`${BASE}/compare/select-winner`, data).then((r) => r.data),

  // ─── Purchase Orders ───
  listPOs: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PurchaseOrder[]>>(`${BASE}/purchase-orders`, { params }).then((r) => r.data),
  getPO: (id: string) =>
    api.get<ApiResponse<PurchaseOrder>>(`${BASE}/purchase-orders/${id}`).then((r) => r.data),
  createPO: (data: Record<string, unknown>) =>
    api.post<ApiResponse<PurchaseOrder>>(`${BASE}/purchase-orders`, data).then((r) => r.data),
  updatePO: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<PurchaseOrder>>(`${BASE}/purchase-orders/${id}`, data).then((r) => r.data),
  poWorkflow: (id: string, data: { action: string; remarks?: string }) =>
    api.post<ApiResponse<PurchaseOrder>>(`${BASE}/purchase-orders/${id}/workflow`, data).then((r) => r.data),
  generatePONumber: () =>
    api.get<ApiResponse<{ number: string }>>(`${BASE}/purchase-orders/generate-number`).then((r) => r.data),

  // ─── Goods Receipts ───
  listGRN: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<GoodsReceipt[]>>(`${BASE}/goods-receipts`, { params }).then((r) => r.data),
  getGRN: (id: string) =>
    api.get<ApiResponse<GoodsReceipt>>(`${BASE}/goods-receipts/${id}`).then((r) => r.data),
  createGRN: (data: Record<string, unknown>) =>
    api.post<ApiResponse<GoodsReceipt>>(`${BASE}/goods-receipts`, data).then((r) => r.data),
  updateGRN: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<GoodsReceipt>>(`${BASE}/goods-receipts/${id}`, data).then((r) => r.data),
  grnWorkflow: (id: string, data: { action: string; remarks?: string }) =>
    api.post<ApiResponse<GoodsReceipt>>(`${BASE}/goods-receipts/${id}/workflow`, data).then((r) => r.data),
  generateGRNNumber: () =>
    api.get<ApiResponse<{ number: string }>>(`${BASE}/goods-receipts/generate-number`).then((r) => r.data),

  // ─── Purchase Invoices ───
  listInvoices: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PurchaseInvoice[]>>(`${BASE}/invoices`, { params }).then((r) => r.data),
  getInvoice: (id: string) =>
    api.get<ApiResponse<PurchaseInvoice>>(`${BASE}/invoices/${id}`).then((r) => r.data),
  createInvoice: (data: Record<string, unknown>) =>
    api.post<ApiResponse<PurchaseInvoice>>(`${BASE}/invoices`, data).then((r) => r.data),
  updateInvoice: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<PurchaseInvoice>>(`${BASE}/invoices/${id}`, data).then((r) => r.data),
  invoiceWorkflow: (id: string, data: { action: string; remarks?: string }) =>
    api.post<ApiResponse<PurchaseInvoice>>(`${BASE}/invoices/${id}/workflow`, data).then((r) => r.data),
  generateInvoiceNumber: () =>
    api.get<ApiResponse<{ number: string }>>(`${BASE}/invoices/generate-number`).then((r) => r.data),
};
