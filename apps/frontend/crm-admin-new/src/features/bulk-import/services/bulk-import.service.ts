import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  ImportJob,
  ImportRow,
  ImportProfile,
  ValidationSummary,
  ImportResult,
  MappingSuggestion,
  ApplyMappingDto,
  SaveProfileDto,
  ImportJobListParams,
  ImportRowListParams,
} from "../types/bulk-import.types";

const BASE_URL = "/api/v1/import";

export const bulkImportService = {
  // ── Upload ─────────────────────────────────────────────
  upload: (file: File, targetEntity: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("targetEntity", targetEntity);
    return apiClient
      .post<ApiResponse<ImportJob>>(`${BASE_URL}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // ── Job Detail ─────────────────────────────────────────
  getJob: (jobId: string) =>
    apiClient
      .get<ApiResponse<ImportJob>>(`${BASE_URL}/${jobId}`)
      .then((r) => r.data),

  // ── Job List ───────────────────────────────────────────
  listJobs: (params?: ImportJobListParams) =>
    apiClient
      .get<ApiResponse<ImportJob[]>>(`${BASE_URL}/jobs`, { params })
      .then((r) => r.data),

  // ── Select Profile ─────────────────────────────────────
  selectProfile: (jobId: string, profileId: string) =>
    apiClient
      .post<ApiResponse<ImportJob>>(`${BASE_URL}/${jobId}/select-profile`, { profileId })
      .then((r) => r.data),

  // ── Apply Mapping ──────────────────────────────────────
  applyMapping: (jobId: string, dto: ApplyMappingDto) =>
    apiClient
      .post<ApiResponse<ImportJob>>(`${BASE_URL}/${jobId}/mapping`, dto)
      .then((r) => r.data),

  // ── Save Profile ───────────────────────────────────────
  saveProfile: (jobId: string, dto: SaveProfileDto) =>
    apiClient
      .post<ApiResponse<ImportProfile>>(`${BASE_URL}/${jobId}/save-profile`, dto)
      .then((r) => r.data),

  // ── Validate (fire-and-forget — returns immediately) ────
  validate: (jobId: string) =>
    apiClient
      .post<ApiResponse<any>>(`${BASE_URL}/${jobId}/validate`)
      .then((r) => r.data),

  // ── Commit (fire-and-forget — returns immediately) ─────
  commit: (jobId: string) =>
    apiClient
      .post<ApiResponse<any>>(`${BASE_URL}/${jobId}/commit`)
      .then((r) => r.data),

  // ── Poll job status (lightweight) ──────────────────────
  getStatus: (jobId: string) =>
    apiClient
      .get<ApiResponse<any>>(`${BASE_URL}/${jobId}/status`)
      .then((r) => r.data),

  // ── Cancel ─────────────────────────────────────────────
  cancel: (jobId: string) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/${jobId}/cancel`)
      .then((r) => r.data),

  // ── Validation Summary ─────────────────────────────────
  getValidationSummary: (jobId: string) =>
    apiClient
      .get<ApiResponse<ValidationSummary>>(`${BASE_URL}/${jobId}/validation-summary`)
      .then((r) => r.data),

  // ── Rows ───────────────────────────────────────────────
  getRows: (jobId: string, params?: ImportRowListParams) =>
    apiClient
      .get<ApiResponse<ImportRow[]>>(`${BASE_URL}/${jobId}/rows`, { params })
      .then((r) => r.data),

  // ── Row Detail ─────────────────────────────────────────
  getRow: (jobId: string, rowId: string) =>
    apiClient
      .get<ApiResponse<ImportRow>>(`${BASE_URL}/${jobId}/rows/${rowId}`)
      .then((r) => r.data),

  // ── Edit Row ───────────────────────────────────────────
  editRow: (jobId: string, rowId: string, editedData: Record<string, unknown>) =>
    apiClient
      .put<ApiResponse<ImportRow>>(`${BASE_URL}/${jobId}/rows/${rowId}`, { editedData })
      .then((r) => r.data),

  // ── Row Action ─────────────────────────────────────────
  rowAction: (jobId: string, rowId: string, action: string) =>
    apiClient
      .post<ApiResponse<ImportRow>>(`${BASE_URL}/${jobId}/rows/${rowId}/action`, { action })
      .then((r) => r.data),

  // ── Bulk Row Action ────────────────────────────────────
  bulkRowAction: (jobId: string, action: string) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/${jobId}/rows/bulk-action`, { action })
      .then((r) => r.data),

  // ── Revalidate Row ─────────────────────────────────────
  revalidateRow: (jobId: string, rowId: string) =>
    apiClient
      .post<ApiResponse<ImportRow>>(`${BASE_URL}/${jobId}/rows/${rowId}/revalidate`)
      .then((r) => r.data),

  // ── Import Result ──────────────────────────────────────
  getResult: (jobId: string) =>
    apiClient
      .get<ApiResponse<ImportResult>>(`${BASE_URL}/${jobId}/result`)
      .then((r) => r.data),

  // ── Download Result Report ─────────────────────────────
  downloadReport: (jobId: string) =>
    apiClient
      .get<Blob>(`${BASE_URL}/${jobId}/result/download`, { responseType: "blob" })
      .then((r) => r.data),

  // ── Mapping Suggestions ────────────────────────────────
  getMappingSuggestions: (targetEntity: string, fileHeaders?: string[]) =>
    apiClient
      .get<ApiResponse<{ targetFields: { key: string; label: string; fieldType?: string; required?: boolean }[]; suggestions: MappingSuggestion[] }>>(
        `${BASE_URL}/mapping-suggestions/${targetEntity}`,
        fileHeaders?.length ? { params: { headers: fileHeaders.join(",") } } : undefined,
      )
      .then((r) => r.data),

  // ── Duplicates ─────────────────────────────────────────
  getDuplicates: (jobId: string, params?: { page?: number; limit?: number }) =>
    apiClient
      .get<ApiResponse<ImportRow[]>>(`${BASE_URL}/${jobId}/duplicates`, { params })
      .then((r) => r.data),

  // ── Profiles ───────────────────────────────────────────
  listProfiles: (params?: { targetEntity?: string; status?: string }) =>
    apiClient
      .get<ApiResponse<ImportProfile[]>>(`${BASE_URL}/profiles`, { params })
      .then((r) => r.data),

  getProfile: (id: string) =>
    apiClient
      .get<ApiResponse<ImportProfile>>(`${BASE_URL}/profiles/${id}`)
      .then((r) => r.data),
};
