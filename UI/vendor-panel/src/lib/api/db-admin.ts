import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { TenantDb, DbFilters } from '@/types/db-admin';

export const dbAdminApi = {
  list: (filters?: DbFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<TenantDb>>>('/admin/db', { params: filters }).then((r) => r.data),

  runMigration: (tenantId: string) =>
    apiClient.post<ApiResponse<TenantDb>>(`/admin/db/${tenantId}/migrate`).then((r) => r.data),

  repair: (tenantId: string) =>
    apiClient.post<ApiResponse<TenantDb>>(`/admin/db/${tenantId}/repair`).then((r) => r.data),

  backup: (tenantId: string) =>
    apiClient.post<ApiResponse<{ url: string }>>(`/admin/db/${tenantId}/backup`).then((r) => r.data),
};
