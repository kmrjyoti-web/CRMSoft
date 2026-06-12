import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type { TenantErrorLog } from '../types/error-log.types';

export function getErrorLogs(params?: {
  page?: number;
  limit?: number;
  severity?: string;
}) {
  return apiClient
    .get<ApiResponse<{ data: TenantErrorLog[]; meta: any }>>(
      '/api/v1/admin/errors/logs',
      { params },
    )
    .then((r) => r.data);
}

export function getErrorStats() {
  return apiClient
    .get<ApiResponse<any>>('/api/v1/admin/errors/logs/stats')
    .then((r) => r.data);
}
