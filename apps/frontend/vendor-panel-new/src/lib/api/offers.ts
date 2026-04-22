import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { SoftwareOffer, OfferCreateData, OfferFilters } from '@/types/offer';

export const offersApi = {
  list: (filters?: OfferFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<SoftwareOffer>>>('/admin/offers', { params: filters }).then((r) => r.data),

  create: (data: OfferCreateData) =>
    apiClient.post<ApiResponse<SoftwareOffer>>('/admin/offers', data).then((r) => r.data),

  update: (id: string, data: Partial<OfferCreateData>) =>
    apiClient.put<ApiResponse<SoftwareOffer>>(`/admin/offers/${id}`, data).then((r) => r.data),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/admin/offers/${id}/deactivate`).then((r) => r.data),
};
