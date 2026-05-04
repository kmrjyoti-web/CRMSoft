import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { License, LicenseFilters } from '@/types/license';

export const licensesApi = {
  list: (filters?: LicenseFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<License>>>('/vendor/licenses', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<License>>(`/vendor/licenses/${id}`).then((r) => r.data),
};
