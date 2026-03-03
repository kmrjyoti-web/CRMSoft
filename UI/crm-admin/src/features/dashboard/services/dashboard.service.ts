import apiClient from "@/services/api-client";

import type {
  DashboardQueryParams,
  ExecutiveKpis,
  PipelineStage,
  FunnelStep,
  RevenueDataPoint,
  LeadSourceItem,
  ReportDefinition,
  GenerateReportParams,
  ExportReportParams,
  DrillDownParams,
  ReportResult,
  ExportHistoryItem,
  ExportHistoryParams,
} from "../types/dashboard.types";

import type { ApiResponse } from "@/types/api-response";

// ---------------------------------------------------------------------------
// Dashboard Service
// ---------------------------------------------------------------------------

export const dashboardService = {
  getExecutive(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<ExecutiveKpis>>("/dashboard/executive", { params });
  },

  getPipeline(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<PipelineStage[]>>("/dashboard/pipeline", { params });
  },

  getFunnel(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<FunnelStep[]>>("/dashboard/funnel", { params });
  },

  getMyDashboard() {
    return apiClient.get<ApiResponse<ExecutiveKpis>>("/dashboard/my");
  },
};

// ---------------------------------------------------------------------------
// Analytics Service
// ---------------------------------------------------------------------------

export const analyticsService = {
  getRevenue(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<RevenueDataPoint[]>>("/analytics/revenue", { params });
  },

  getLeadSources(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<LeadSourceItem[]>>("/analytics/lead-sources", { params });
  },

  getLostReasons(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<Record<string, number>[]>>("/analytics/lost-reasons", { params });
  },

  getActivityHeatmap(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<unknown>>("/analytics/activity-heatmap", { params });
  },

  getAging(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<unknown>>("/analytics/aging", { params });
  },

  getVelocity(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<unknown>>("/analytics/velocity", { params });
  },
};

// ---------------------------------------------------------------------------
// MIS Reports Service
// ---------------------------------------------------------------------------

export const reportsService = {
  getDefinitions(category?: string) {
    return apiClient.get<ApiResponse<ReportDefinition[]>>("/mis-reports/definitions", {
      params: category ? { category } : undefined,
    });
  },

  getDefinition(code: string) {
    return apiClient.get<ApiResponse<ReportDefinition>>(`/mis-reports/definitions/${code}`);
  },

  generate(code: string, params: GenerateReportParams) {
    return apiClient.post<ApiResponse<ReportResult>>(`/mis-reports/generate/${code}`, params);
  },

  export(code: string, params: ExportReportParams) {
    return apiClient.post<ApiResponse<{ exportId: string }>>(`/mis-reports/export/${code}`, params);
  },

  drillDown(code: string, params: DrillDownParams) {
    return apiClient.post<ApiResponse<ReportResult>>(`/mis-reports/drill-down/${code}`, params);
  },

  getExportHistory(params?: ExportHistoryParams) {
    return apiClient.get<ApiResponse<ExportHistoryItem[]>>("/mis-reports/exports", { params });
  },

  downloadExport(id: string) {
    return apiClient.get<Blob>(`/mis-reports/exports/${id}/download`, { responseType: "blob" });
  },
};
