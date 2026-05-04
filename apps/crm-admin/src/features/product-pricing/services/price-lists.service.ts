import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

const BASE = "/api/v1/price-lists";

export interface PriceListRecord {
  id: string;
  name: string;
  description?: string;
  currency: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  _count?: { items: number };
}

export interface PriceListItemRecord {
  id: string;
  priceListId: string;
  productId: string;
  sellingPrice: number;
  minQuantity: number;
  maxQuantity?: number;
  marginPercent?: number;
}

export interface CreatePriceListDto {
  name: string;
  description?: string;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
  priority?: number;
}

export interface AddPriceListItemDto {
  productId: string;
  sellingPrice: number;
  minQuantity?: number;
  maxQuantity?: number;
  marginPercent?: number;
}

export const priceListsService = {
  list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    apiClient.get<ApiResponse<PriceListRecord[]>>(BASE, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<PriceListRecord & { items: PriceListItemRecord[] }>>(`${BASE}/${id}`).then((r) => r.data),

  create: (dto: CreatePriceListDto) =>
    apiClient.post<ApiResponse<PriceListRecord>>(BASE, dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreatePriceListDto>) =>
    apiClient.patch<ApiResponse<PriceListRecord>>(`${BASE}/${id}`, dto).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data),

  addItem: (priceListId: string, dto: AddPriceListItemDto) =>
    apiClient.post<ApiResponse<PriceListItemRecord>>(`${BASE}/${priceListId}/items`, dto).then((r) => r.data),

  updateItem: (priceListId: string, itemId: string, dto: Partial<AddPriceListItemDto>) =>
    apiClient.patch<ApiResponse<PriceListItemRecord>>(`${BASE}/${priceListId}/items/${itemId}`, dto).then((r) => r.data),

  removeItem: (priceListId: string, itemId: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/${priceListId}/items/${itemId}`).then((r) => r.data),
};
