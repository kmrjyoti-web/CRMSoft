import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  AuditLogItem,
  AuditDiff,
  AuditQueryParams,
  AuditSearchParams,
  AuditStats,
} from "../types/audit.types";

const BASE_URL = "/api/v1/audit";

export const auditService = {
  /** Global audit feed with pagination & filters. */
  getFeed: (params?: AuditQueryParams) =>
    apiClient
      .get<ApiResponse<AuditLogItem[]>>(`${BASE_URL}/feed`, { params })
      .then((r) => r.data),

  /** Full-text search across audit logs. */
  search: (params?: AuditSearchParams) =>
    apiClient
      .get<ApiResponse<AuditLogItem[]>>(`${BASE_URL}/search`, { params })
      .then((r) => r.data),

  /** Single audit log detail. */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<AuditLogItem>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  /** Diff view for a specific audit log. */
  getDiff: (id: string) =>
    apiClient
      .get<ApiResponse<AuditDiff>>(`${BASE_URL}/${id}/diff`)
      .then((r) => r.data),

  /** Aggregate statistics. */
  getStats: (params?: Pick<AuditQueryParams, "dateFrom" | "dateTo">) =>
    apiClient
      .get<ApiResponse<AuditStats>>(`${BASE_URL}/stats`, { params })
      .then((r) => r.data),

  /** Export audit trail. */
  export: (body: {
    format: "CSV" | "XLSX";
    dateFrom: string;
    dateTo: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
  }) =>
    apiClient
      .post<ApiResponse<{ message: string }>>(`${BASE_URL}/export`, body)
      .then((r) => r.data),
};
