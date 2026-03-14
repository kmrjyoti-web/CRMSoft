import apiClient from "@/services/api-client";

import type {
  DashboardQueryParams,
  ExecutiveKpis,
  MyDashboardData,
  PipelineStage,
  FunnelStep,
  RevenueDataPoint,
  LeadSourceItem,
  LostReasonItem,
  HeatmapCell,
  AgingBucket,
  VelocityMetrics,
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

const DASHBOARD_URL = "/api/v1/dashboard";
const ANALYTICS_URL = "/api/v1/analytics";
const MIS_REPORTS_URL = "/api/v1/mis-reports";

export const dashboardService = {
  getExecutive(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<ExecutiveKpis>>(`${DASHBOARD_URL}/executive`, { params });
  },

  getPipeline(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<PipelineStage[]>>(`${DASHBOARD_URL}/pipeline`, { params });
  },

  getFunnel(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<FunnelStep[]>>(`${DASHBOARD_URL}/funnel`, { params });
  },

  getMyDashboard() {
    return apiClient.get<ApiResponse<MyDashboardData>>(`${DASHBOARD_URL}/my`);
  },
};

// ---------------------------------------------------------------------------
// Analytics Service
// ---------------------------------------------------------------------------

export const analyticsService = {
  getRevenue(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<RevenueDataPoint[]>>(`${ANALYTICS_URL}/revenue`, { params });
  },

  getLeadSources(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<LeadSourceItem[]>>(`${ANALYTICS_URL}/lead-sources`, { params });
  },

  getLostReasons(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<LostReasonItem[]>>(`${ANALYTICS_URL}/lost-reasons`, { params });
  },

  getActivityHeatmap(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<HeatmapCell[]>>(`${ANALYTICS_URL}/activity-heatmap`, { params });
  },

  getAging(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<AgingBucket[]>>(`${ANALYTICS_URL}/aging`, { params });
  },

  getVelocity(params: DashboardQueryParams) {
    return apiClient.get<ApiResponse<VelocityMetrics>>(`${ANALYTICS_URL}/velocity`, { params });
  },
};

// ---------------------------------------------------------------------------
// MIS Reports Service
// ---------------------------------------------------------------------------

export const reportsService = {
  getDefinitions(category?: string) {
    return apiClient.get<ApiResponse<ReportDefinition[]>>(`${MIS_REPORTS_URL}/definitions`, {
      params: category ? { category } : undefined,
    });
  },

  getDefinition(code: string) {
    return apiClient.get<ApiResponse<ReportDefinition>>(`${MIS_REPORTS_URL}/definitions/${code}`);
  },

  generate(code: string, params: GenerateReportParams) {
    return apiClient.post<ApiResponse<ReportResult>>(`${MIS_REPORTS_URL}/generate/${code}`, params);
  },

  export(code: string, params: ExportReportParams) {
    return apiClient.post<ApiResponse<{ exportId: string }>>(`${MIS_REPORTS_URL}/export/${code}`, params);
  },

  drillDown(code: string, params: DrillDownParams) {
    return apiClient.post<ApiResponse<ReportResult>>(`${MIS_REPORTS_URL}/drill-down/${code}`, params);
  },

  getExportHistory(params?: ExportHistoryParams) {
    return apiClient.get<ApiResponse<ExportHistoryItem[]>>(`${MIS_REPORTS_URL}/exports`, { params });
  },

  downloadExport(id: string) {
    return apiClient.get<Blob>(`${MIS_REPORTS_URL}/exports/${id}/download`, { responseType: "blob" });
  },
};
