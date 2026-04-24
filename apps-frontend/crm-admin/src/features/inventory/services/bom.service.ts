import api from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  BOMFormula, BOMProduction, ScrapRecord,
  StockCheckResult, CostBreakdown,
  ProductionReport, YieldReport, ScrapReport,
  CreateFormulaPayload, UpdateFormulaPayload,
  StartProductionPayload, CompleteProductionPayload,
  RecordScrapPayload,
} from "../types/bom.types";

const BASE = "/api/v1/inventory";

export const bomService = {
  // ─── Recipes ───
  listRecipes: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<BOMFormula[]>>(`${BASE}/recipes`, { params }).then((r) => r.data),

  getRecipe: (id: string) =>
    api.get<ApiResponse<BOMFormula>>(`${BASE}/recipes/${id}`).then((r) => r.data),

  createRecipe: (payload: CreateFormulaPayload) =>
    api.post<ApiResponse<BOMFormula>>(`${BASE}/recipes`, payload).then((r) => r.data),

  updateRecipe: (id: string, payload: UpdateFormulaPayload) =>
    api.patch<ApiResponse<BOMFormula>>(`${BASE}/recipes/${id}`, payload).then((r) => r.data),

  duplicateRecipe: (id: string, newName: string) =>
    api.post<ApiResponse<BOMFormula>>(`${BASE}/recipes/${id}/duplicate`, { newName }).then((r) => r.data),

  deactivateRecipe: (id: string) =>
    api.post<ApiResponse<BOMFormula>>(`${BASE}/recipes/${id}/deactivate`).then((r) => r.data),

  checkStock: (id: string, quantity: number, locationId: string) =>
    api.post<ApiResponse<StockCheckResult>>(`${BASE}/recipes/${id}/check-stock`, { quantity, locationId }).then((r) => r.data),

  // ─── Production ───
  listProduction: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<BOMProduction[]>>(`${BASE}/production`, { params }).then((r) => r.data),

  getProduction: (id: string) =>
    api.get<ApiResponse<BOMProduction>>(`${BASE}/production/${id}`).then((r) => r.data),

  startProduction: (payload: StartProductionPayload) =>
    api.post<ApiResponse<BOMProduction>>(`${BASE}/production`, payload).then((r) => r.data),

  completeProduction: (id: string, payload: CompleteProductionPayload) =>
    api.post<ApiResponse<BOMProduction>>(`${BASE}/production/${id}/complete`, payload).then((r) => r.data),

  cancelProduction: (id: string, reason: string) =>
    api.post<ApiResponse<BOMProduction>>(`${BASE}/production/${id}/cancel`, { reason }).then((r) => r.data),

  // ─── Scrap ───
  listScrap: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ScrapRecord[]>>(`${BASE}/scrap`, { params }).then((r) => r.data),

  recordScrap: (payload: RecordScrapPayload) =>
    api.post<ApiResponse<ScrapRecord>>(`${BASE}/scrap`, payload).then((r) => r.data),

  writeOffScrap: (id: string, disposalMethod?: string) =>
    api.post<ApiResponse<ScrapRecord>>(`${BASE}/scrap/${id}/write-off`, { disposalMethod }).then((r) => r.data),

  // ─── Reports ───
  productionReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ProductionReport>>(`${BASE}/reports/production`, { params }).then((r) => r.data),

  consumptionReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<any>>(`${BASE}/reports/consumption`, { params }).then((r) => r.data),

  costingReport: (formulaId: string) =>
    api.get<ApiResponse<CostBreakdown>>(`${BASE}/reports/bom-costing`, { params: { formulaId } }).then((r) => r.data),

  yieldReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<YieldReport>>(`${BASE}/reports/yield`, { params }).then((r) => r.data),

  scrapReport: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ScrapReport>>(`${BASE}/reports/scrap`, { params }).then((r) => r.data),
};
