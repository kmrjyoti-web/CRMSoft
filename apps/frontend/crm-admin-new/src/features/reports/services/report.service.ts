import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  ReportDefinition, ReportData, ReportTemplate,
  CreateTemplatePayload, UpdateTemplatePayload,
  ReportBookmark, CreateBookmarkPayload,
  ScheduledReport, CreateSchedulePayload, UpdateSchedulePayload,
  GenerateReportParams, ExportReportParams, ExportHistoryItem,
  DrillDownParams, DrillDownResult,
} from '../types/report.types';

const BASE = '/api/v1/mis-reports';

// ── Definitions ──────────────────────────────────────────────────────

export const definitionService = {
  list(category?: string) {
    return apiClient
      .get<ApiResponse<ReportDefinition[]>>(`${BASE}/definitions`, {
        params: category ? { category } : undefined,
      })
      .then((r) => r.data);
  },

  get(code: string) {
    return apiClient
      .get<ApiResponse<ReportDefinition>>(`${BASE}/definitions/${code}`)
      .then((r) => r.data);
  },
};

// ── Generate / Export ────────────────────────────────────────────────

export const reportDataService = {
  generate(code: string, params: GenerateReportParams) {
    return apiClient
      .post<ApiResponse<ReportData>>(`${BASE}/generate/${code}`, params)
      .then((r) => r.data);
  },

  export(code: string, params: ExportReportParams) {
    return apiClient
      .post<ApiResponse<{ exportId: string }>>(`${BASE}/export/${code}`, params)
      .then((r) => r.data);
  },

  drillDown(code: string, params: DrillDownParams) {
    return apiClient
      .post<ApiResponse<DrillDownResult>>(`${BASE}/drill-down/${code}`, params)
      .then((r) => r.data);
  },

  getExportHistory(params?: { reportCode?: string; page?: number; limit?: number }) {
    return apiClient
      .get<ApiResponse<ExportHistoryItem[]>>(`${BASE}/exports`, { params })
      .then((r) => r.data);
  },

  downloadExport(id: string) {
    return apiClient.get<Blob>(`${BASE}/exports/${id}/download`, { responseType: 'blob' });
  },
};

// ── Templates ────────────────────────────────────────────────────────

export const templateService = {
  list() {
    return apiClient
      .get<ApiResponse<ReportTemplate[]>>(`${BASE}/templates`)
      .then((r) => r.data);
  },

  get(id: string) {
    return apiClient
      .get<ApiResponse<ReportTemplate>>(`${BASE}/templates/${id}`)
      .then((r) => r.data);
  },

  create(payload: CreateTemplatePayload) {
    return apiClient
      .post<ApiResponse<ReportTemplate>>(`${BASE}/templates`, payload)
      .then((r) => r.data);
  },

  update(id: string, payload: UpdateTemplatePayload) {
    return apiClient
      .patch<ApiResponse<ReportTemplate>>(`${BASE}/templates/${id}`, payload)
      .then((r) => r.data);
  },

  delete(id: string) {
    return apiClient.delete(`${BASE}/templates/${id}`).then((r) => r.data);
  },
};

// ── Bookmarks ────────────────────────────────────────────────────────

export const bookmarkService = {
  list() {
    return apiClient
      .get<ApiResponse<ReportBookmark[]>>(`${BASE}/bookmarks`)
      .then((r) => r.data);
  },

  create(payload: CreateBookmarkPayload) {
    return apiClient
      .post<ApiResponse<ReportBookmark>>(`${BASE}/bookmarks`, payload)
      .then((r) => r.data);
  },

  update(id: string, payload: { name?: string; filters?: Record<string, unknown>; isPinned?: boolean }) {
    return apiClient
      .patch<ApiResponse<ReportBookmark>>(`${BASE}/bookmarks/${id}`, payload)
      .then((r) => r.data);
  },

  delete(id: string) {
    return apiClient.delete(`${BASE}/bookmarks/${id}`).then((r) => r.data);
  },
};

// ── Schedules ────────────────────────────────────────────────────────

export const scheduleService = {
  list() {
    return apiClient
      .get<ApiResponse<ScheduledReport[]>>(`${BASE}/schedules`)
      .then((r) => r.data);
  },

  get(id: string) {
    return apiClient
      .get<ApiResponse<ScheduledReport>>(`${BASE}/schedules/${id}`)
      .then((r) => r.data);
  },

  create(payload: CreateSchedulePayload) {
    return apiClient
      .post<ApiResponse<ScheduledReport>>(`${BASE}/schedules`, payload)
      .then((r) => r.data);
  },

  update(id: string, payload: UpdateSchedulePayload) {
    return apiClient
      .patch<ApiResponse<ScheduledReport>>(`${BASE}/schedules/${id}`, payload)
      .then((r) => r.data);
  },

  delete(id: string) {
    return apiClient.delete(`${BASE}/schedules/${id}`).then((r) => r.data);
  },
};
