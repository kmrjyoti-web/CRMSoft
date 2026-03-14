import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { ErrorLog, ErrorLogFilters, ErrorStats, ErrorTrend, ErrorAutoReportRule } from '@/types/error-log';

export const errorLogsApi = {
  list: (filters?: ErrorLogFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<ErrorLog>>>('/admin/error-logs', { params: filters }).then((r) => r.data),

  getByTraceId: (traceId: string) =>
    apiClient.get<ApiResponse<ErrorLog>>(`/admin/error-logs/trace/${traceId}`).then((r) => r.data),

  getStats: () =>
    apiClient.get<ApiResponse<ErrorStats>>('/admin/error-logs/stats').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/admin/error-logs/${id}`).then((r) => r.data),

  getTrends: () =>
    apiClient.get<ApiResponse<ErrorTrend[]>>('/admin/error-logs/trends').then((r) => r.data),

  resolve: (id: string, resolution: string) =>
    apiClient.post(`/admin/error-logs/${id}/resolve`, { resolution }).then((r) => r.data),

  assign: (id: string, assignedToId: string, assignedToName: string) =>
    apiClient.post(`/admin/error-logs/${id}/assign`, { assignedToId, assignedToName }).then((r) => r.data),

  ignore: (id: string) =>
    apiClient.post(`/admin/error-logs/${id}/ignore`).then((r) => r.data),

  listRules: () =>
    apiClient.get<ApiResponse<ErrorAutoReportRule[]>>('/admin/error-logs/auto-report-rules').then((r) => r.data),

  createRule: (data: Record<string, unknown>) =>
    apiClient.post('/admin/error-logs/auto-report-rules', data).then((r) => r.data),

  updateRule: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/error-logs/auto-report-rules/${id}`, data).then((r) => r.data),

  deleteRule: (id: string) =>
    apiClient.delete(`/admin/error-logs/auto-report-rules/${id}`).then((r) => r.data),
};
