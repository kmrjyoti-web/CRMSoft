import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { QuotationOverview, ConversionFunnel, QuotationTrend, IndustryAnalytics, ProductAnalytics, BestQuotation, QuotationComparison, AnalyticsFilters } from "../types/quotation-analytics.types";

const BASE = "/api/v1/quotation-analytics";

export function getOverview(params?: AnalyticsFilters) {
  return apiClient.get<ApiResponse<QuotationOverview>>(`${BASE}/overview`, { params }).then((r) => r.data);
}

export function getConversion(params?: AnalyticsFilters) {
  return apiClient.get<ApiResponse<ConversionFunnel>>(`${BASE}/conversion`, { params }).then((r) => r.data);
}

export function getIndustryAnalytics(params?: AnalyticsFilters) {
  return apiClient.get<ApiResponse<IndustryAnalytics[]>>(`${BASE}/industry`, { params }).then((r) => r.data);
}

export function getProductAnalytics(params?: AnalyticsFilters) {
  return apiClient.get<ApiResponse<ProductAnalytics[]>>(`${BASE}/products`, { params }).then((r) => r.data);
}

export function getBestQuotations(params?: { limit?: number } & AnalyticsFilters) {
  return apiClient.get<ApiResponse<BestQuotation[]>>(`${BASE}/best-quotations`, { params }).then((r) => r.data);
}

export function getComparison(ids: string[]) {
  return apiClient.get<ApiResponse<QuotationComparison>>(`${BASE}/comparison`, { params: { ids: ids.join(",") } }).then((r) => r.data);
}
