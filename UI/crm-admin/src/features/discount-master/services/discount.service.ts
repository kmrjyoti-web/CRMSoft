import apiClient from '@/services/api-client';
import type { AgencyDiscount, ItemDiscount, Promotion } from '../types/discount.types';

// ── Agency Discounts ──────────────────────────────────────────────────

export const agencyDiscountService = {
  list: () =>
    apiClient.get<{ data: AgencyDiscount[] }>('/api/v1/discounts/agency').then((r) => r.data),
  create: (dto: Partial<AgencyDiscount>) =>
    apiClient.post<{ data: AgencyDiscount }>('/api/v1/discounts/agency', dto).then((r) => r.data),
  update: (id: string, dto: Partial<AgencyDiscount>) =>
    apiClient.patch<{ data: AgencyDiscount }>(`/api/v1/discounts/agency/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/api/v1/discounts/agency/${id}`).then((r) => r.data),
};

// ── Item Discounts ────────────────────────────────────────────────────

export const itemDiscountService = {
  list: () =>
    apiClient.get<{ data: ItemDiscount[] }>('/api/v1/discounts/item').then((r) => r.data),
  create: (dto: Partial<ItemDiscount>) =>
    apiClient.post<{ data: ItemDiscount }>('/api/v1/discounts/item', dto).then((r) => r.data),
  update: (id: string, dto: Partial<ItemDiscount>) =>
    apiClient.patch<{ data: ItemDiscount }>(`/api/v1/discounts/item/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/api/v1/discounts/item/${id}`).then((r) => r.data),
};

// ── Promotions ────────────────────────────────────────────────────────

export const promotionService = {
  list: () =>
    apiClient.get<{ data: Promotion[] }>('/api/v1/promotions').then((r) => r.data),
  create: (dto: Partial<Promotion>) =>
    apiClient.post<{ data: Promotion }>('/api/v1/promotions', dto).then((r) => r.data),
  update: (id: string, dto: Partial<Promotion>) =>
    apiClient.patch<{ data: Promotion }>(`/api/v1/promotions/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/api/v1/promotions/${id}`).then((r) => r.data),
};
