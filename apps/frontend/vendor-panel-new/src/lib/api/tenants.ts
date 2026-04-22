import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { TenantItem, TenantFilters, TenantDetail } from '@/types/tenant-item';

export const tenantsApi = {
  list: (filters?: TenantFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<TenantItem>>>('/vendor/tenants', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<TenantDetail>>(`/vendor/tenants/${id}`).then((r) => r.data),

  suspend: (id: string) =>
    apiClient.post<ApiResponse<TenantItem>>(`/vendor/tenants/${id}/suspend`).then((r) => r.data),

  activate: (id: string) =>
    apiClient.post<ApiResponse<TenantItem>>(`/vendor/tenants/${id}/activate`).then((r) => r.data),

  extendTrial: (id: string, days: number) =>
    apiClient.post<ApiResponse<TenantItem>>(`/vendor/tenants/${id}/extend-trial`, { days }).then((r) => r.data),
};
