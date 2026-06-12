import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { SystemHealth, MetricPoint } from '@/types/system-health';

export const systemHealthApi = {
  getHealth: () =>
    apiClient.get<ApiResponse<SystemHealth>>('/admin/system-health').then((r) => r.data),

  getMetrics: (metric: string, hours?: number) =>
    apiClient.get<ApiResponse<MetricPoint[]>>(`/admin/system-health/metrics/${metric}`, { params: { hours } }).then((r) => r.data),
};
