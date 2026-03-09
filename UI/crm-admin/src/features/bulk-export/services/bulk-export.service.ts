import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { ExportJob, CreateExportDto } from "../types/bulk-export.types";

const BASE = "/api/v1/export";

export function createExport(dto: CreateExportDto) {
  return apiClient.post<ApiResponse<ExportJob>>(BASE, dto).then((r) => r.data);
}

export function listExportJobs(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<ExportJob[]>>(`${BASE}/jobs`, { params }).then((r) => r.data);
}

export function getExportJob(id: string) {
  return apiClient.get<ApiResponse<ExportJob>>(`${BASE}/jobs/${id}`).then((r) => r.data);
}

export function downloadExport(id: string) {
  return apiClient.get<Blob>(`${BASE}/${id}/download`, { responseType: "blob" }).then((r) => r.data);
}

export function downloadTemplate(entityType: string) {
  return apiClient.get<Blob>(`${BASE}/template/${entityType}`, { responseType: "blob" }).then((r) => r.data);
}
