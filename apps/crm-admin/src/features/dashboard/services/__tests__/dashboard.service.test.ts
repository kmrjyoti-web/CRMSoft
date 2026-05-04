import apiClient from "@/services/api-client";

import { dashboardService, analyticsService, reportsService } from "../dashboard.service";

jest.mock("@/services/api-client", () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe("dashboardService", () => {
  it("has all service methods", () => {
    expect(dashboardService.getExecutive).toBeDefined();
    expect(dashboardService.getPipeline).toBeDefined();
    expect(dashboardService.getFunnel).toBeDefined();
    expect(dashboardService.getMyDashboard).toBeDefined();
  });

  it("getExecutive calls GET /dashboard/executive with params", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31" };
    await dashboardService.getExecutive(params);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/dashboard/executive", { params });
  });

  it("getPipeline calls GET /dashboard/pipeline", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31" };
    await dashboardService.getPipeline(params);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/dashboard/pipeline", { params });
  });

  it("getMyDashboard calls GET /dashboard/my", async () => {
    await dashboardService.getMyDashboard();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/dashboard/my");
  });
});

describe("analyticsService", () => {
  it("has all service methods", () => {
    expect(analyticsService.getRevenue).toBeDefined();
    expect(analyticsService.getLeadSources).toBeDefined();
    expect(analyticsService.getLostReasons).toBeDefined();
    expect(analyticsService.getActivityHeatmap).toBeDefined();
    expect(analyticsService.getAging).toBeDefined();
    expect(analyticsService.getVelocity).toBeDefined();
  });

  it("getRevenue calls GET /analytics/revenue with params", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31" };
    await analyticsService.getRevenue(params);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/analytics/revenue", { params });
  });

  it("getLeadSources calls GET /analytics/lead-sources", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31" };
    await analyticsService.getLeadSources(params);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/analytics/lead-sources", { params });
  });
});

describe("reportsService", () => {
  it("has all service methods", () => {
    expect(reportsService.getDefinitions).toBeDefined();
    expect(reportsService.getDefinition).toBeDefined();
    expect(reportsService.generate).toBeDefined();
    expect(reportsService.export).toBeDefined();
    expect(reportsService.drillDown).toBeDefined();
    expect(reportsService.getExportHistory).toBeDefined();
    expect(reportsService.downloadExport).toBeDefined();
  });

  it("getDefinitions calls GET /mis-reports/definitions", async () => {
    await reportsService.getDefinitions("Sales");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/mis-reports/definitions", {
      params: { category: "Sales" },
    });
  });

  it("generate sends POST /mis-reports/generate/:code", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31" };
    await reportsService.generate("SALES_SUMMARY", params);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/mis-reports/generate/SALES_SUMMARY", params);
  });

  it("export sends POST /mis-reports/export/:code", async () => {
    const params = { dateFrom: "2026-01-01", dateTo: "2026-01-31", format: "PDF" as const };
    await reportsService.export("SALES_SUMMARY", params);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/mis-reports/export/SALES_SUMMARY", params);
  });
});
