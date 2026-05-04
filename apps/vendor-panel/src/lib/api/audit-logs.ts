import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { AuditLog, AuditLogFilters } from '@/types/audit-log';

export const auditLogsApi = {
  list: (filters?: AuditLogFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', { params: filters }).then((r) => r.data),
};
