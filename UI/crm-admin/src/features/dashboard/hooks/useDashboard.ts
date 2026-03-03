import { useMutation, useQuery } from "@tanstack/react-query";

import {
  dashboardService,
  analyticsService,
  reportsService,
} from "../services/dashboard.service";

import type {
  DashboardQueryParams,
  GenerateReportParams,
  ExportReportParams,
  ExportHistoryParams,
} from "../types/dashboard.types";

const DASHBOARD_KEY = "dashboard";
const ANALYTICS_KEY = "analytics";
const REPORTS_KEY = "reports";

// ---------------------------------------------------------------------------
// Dashboard hooks
// ---------------------------------------------------------------------------

export function useExecutiveDashboard(params: DashboardQueryParams) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "executive", params],
    queryFn: () => dashboardService.getExecutive(params).then((r) => r.data),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

export function usePipeline(params: DashboardQueryParams) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "pipeline", params],
    queryFn: () => dashboardService.getPipeline(params).then((r) => r.data),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

export function useFunnel(params: DashboardQueryParams) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "funnel", params],
    queryFn: () => dashboardService.getFunnel(params).then((r) => r.data),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

export function useMyDashboard() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "my"],
    queryFn: () => dashboardService.getMyDashboard().then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Analytics hooks
// ---------------------------------------------------------------------------

export function useRevenueAnalytics(params: DashboardQueryParams) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "revenue", params],
    queryFn: () => analyticsService.getRevenue(params).then((r) => r.data),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

export function useLeadSources(params: DashboardQueryParams) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "lead-sources", params],
    queryFn: () => analyticsService.getLeadSources(params).then((r) => r.data),
    enabled: !!params.dateFrom && !!params.dateTo,
  });
}

// ---------------------------------------------------------------------------
// Report hooks
// ---------------------------------------------------------------------------

export function useReportDefinitions(category?: string) {
  return useQuery({
    queryKey: [REPORTS_KEY, "definitions", category],
    queryFn: () => reportsService.getDefinitions(category).then((r) => r.data),
  });
}

export function useReportDefinition(code: string) {
  return useQuery({
    queryKey: [REPORTS_KEY, "definition", code],
    queryFn: () => reportsService.getDefinition(code).then((r) => r.data),
    enabled: !!code,
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: ({ code, params }: { code: string; params: GenerateReportParams }) =>
      reportsService.generate(code, params).then((r) => r.data),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ code, params }: { code: string; params: ExportReportParams }) =>
      reportsService.export(code, params).then((r) => r.data),
  });
}

export function useExportHistory(params?: ExportHistoryParams) {
  return useQuery({
    queryKey: [REPORTS_KEY, "exports", params],
    queryFn: () => reportsService.getExportHistory(params).then((r) => r.data),
  });
}
