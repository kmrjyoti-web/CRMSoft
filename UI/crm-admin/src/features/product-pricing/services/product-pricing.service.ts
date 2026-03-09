import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  ProductPrice,
  PriceList,
  EffectivePrice,
  SetPricesDto,
  SetGroupPriceDto,
  SetSlabPricesDto,
  EffectivePriceDto,
  BulkUpdatePricesDto,
} from "../types/product-pricing.types";

const BASE = "/api/v1/pricing";

export function getProductPrices(productId: string, params?: { priceType?: string; groupId?: string }) {
  return apiClient.get<ApiResponse<ProductPrice[]>>(`${BASE}/${productId}/prices`, { params }).then((r) => r.data);
}

export function getPriceList(productId: string) {
  return apiClient.get<ApiResponse<PriceList>>(`${BASE}/${productId}/price-list`).then((r) => r.data);
}

export function setPrices(productId: string, dto: SetPricesDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${productId}/prices`, dto).then((r) => r.data);
}

export function setGroupPrice(productId: string, dto: SetGroupPriceDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${productId}/group-price`, dto).then((r) => r.data);
}

export function setSlabPrices(productId: string, dto: SetSlabPricesDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${productId}/slab-prices`, dto).then((r) => r.data);
}

export function getEffectivePrice(dto: EffectivePriceDto) {
  return apiClient.post<ApiResponse<EffectivePrice>>(`${BASE}/effective-price`, dto).then((r) => r.data);
}

export function bulkUpdatePrices(dto: BulkUpdatePricesDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/bulk-update`, dto).then((r) => r.data);
}

export function comparePrices(productIds: string[]) {
  return apiClient.get<ApiResponse<Record<string, unknown>>>(`${BASE}/compare`, { params: { productIds: productIds.join(",") } }).then((r) => r.data);
}

export function deletePrice(priceId: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${priceId}`).then((r) => r.data);
}
