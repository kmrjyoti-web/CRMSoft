import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { ServiceRate, ServiceRateCreateData } from '@/types/service-rate';

export const serviceRatesApi = {
  list: (params?: { search?: string; category?: string; industryCode?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<ServiceRate>>>('/admin/wallet/service-rates', { params }).then((r) => r.data),

  create: (data: ServiceRateCreateData) =>
    apiClient.post<ApiResponse<ServiceRate>>('/admin/wallet/service-rates', data).then((r) => r.data),

  update: (id: string, data: Partial<ServiceRateCreateData>) =>
    apiClient.put<ApiResponse<ServiceRate>>(`/admin/wallet/service-rates/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/wallet/service-rates/${id}`).then((r) => r.data),
};
