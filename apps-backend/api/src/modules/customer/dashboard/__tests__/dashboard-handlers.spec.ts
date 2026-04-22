// @ts-nocheck
import { NotFoundException } from '@nestjs/common';

// ─── Common date fixtures ─────────────────────────────────────────────────────
const from = new Date('2025-01-01');
const to = new Date('2025-12-31');

// ─── Mock service factories ───────────────────────────────────────────────────
const mockDashboardAggregator = {
  getExecutiveDashboard: jest.fn().mockResolvedValue({ summary: {} }),
  getMyDashboard: jest.fn().mockResolvedValue({ leads: 5, activities: 10 }),
};

const mockRevenueAnalytics = {
  getRevenueAnalytics: jest.fn().mockResolvedValue({ total: 100000 }),
  getAgingAnalysis: jest.fn().mockResolvedValue({ buckets: [] }),
  getLeadSourceAnalysis: jest.fn().mockResolvedValue({ sources: [] }),
  getLostReasonAnalysis: jest.fn().mockResolvedValue({ reasons: [] }),
  getVelocityMetrics: jest.fn().mockResolvedValue({ avgDays: 14 }),
};

const mockActivityAnalytics = {
  getActivityHeatmap: jest.fn().mockResolvedValue({ weeks: [] }),
};

const mockPipelineService = {
  getSalesFunnel: jest.fn().mockResolvedValue({ stages: [] }),
  getSalesPipeline: jest.fn().mockResolvedValue({ total: 0, deals: [] }),
};

const mockTeamPerformance = {
  getTeamPerformance: jest.fn().mockResolvedValue({ members: [] }),
  getLeaderboard: jest.fn().mockResolvedValue({ rankings: [] }),
};

const mockTargetCalculator = {
  getTargetTracking: jest.fn().mockResolvedValue({ targets: [] }),
};

const mockReportExportService = {
  exportReport: jest.fn().mockResolvedValue({ url: 'https://r2.example.com/report.csv' }),
  getExportHistory: jest.fn().mockResolvedValue({ data: [], total: 0 }),
};

const makePrisma = () => {
  const p: any = {
    salesTarget: {
      findUnique: jest.fn().mockResolvedValue({ id: 'target-1', isActive: true, metric: 'DEALS_CLOSED', targetValue: 50 }),
      create: jest.fn().mockResolvedValue({ id: 'target-1', metric: 'DEALS_CLOSED', targetValue: 50 }),
      update: jest.fn().mockResolvedValue({ id: 'target-1', isActive: false }),
    },
  };
  p.working = p;
  return p;
};

// ─── Imports ─────────────────────────────────────────────────────────────────
import { CreateTargetHandler } from '../application/commands/create-target/create-target.handler';
import { CreateTargetCommand } from '../application/commands/create-target/create-target.command';
import { DeleteTargetHandler } from '../application/commands/delete-target/delete-target.handler';
import { DeleteTargetCommand } from '../application/commands/delete-target/delete-target.command';
import { UpdateTargetHandler } from '../application/commands/update-target/update-target.handler';
import { UpdateTargetCommand } from '../application/commands/update-target/update-target.command';
import { ExportReportHandler } from '../application/commands/export-report/export-report.handler';
import { ExportReportCommand } from '../application/commands/export-report/export-report.command';
import { GetActivityHeatmapHandler } from '../application/queries/get-activity-heatmap/get-activity-heatmap.handler';
import { GetActivityHeatmapQuery } from '../application/queries/get-activity-heatmap/get-activity-heatmap.query';
import { GetAgingAnalysisHandler } from '../application/queries/get-aging-analysis/get-aging-analysis.handler';
import { GetAgingAnalysisQuery } from '../application/queries/get-aging-analysis/get-aging-analysis.query';
import { GetExecutiveDashboardHandler } from '../application/queries/get-executive-dashboard/get-executive-dashboard.handler';
import { GetExecutiveDashboardQuery } from '../application/queries/get-executive-dashboard/get-executive-dashboard.query';
import { GetLeadSourceAnalysisHandler } from '../application/queries/get-lead-source-analysis/get-lead-source-analysis.handler';
import { GetLeadSourceAnalysisQuery } from '../application/queries/get-lead-source-analysis/get-lead-source-analysis.query';
import { GetLeaderboardHandler } from '../application/queries/get-leaderboard/get-leaderboard.handler';
import { GetLeaderboardQuery } from '../application/queries/get-leaderboard/get-leaderboard.query';
import { GetLostReasonAnalysisHandler } from '../application/queries/get-lost-reason-analysis/get-lost-reason-analysis.handler';
import { GetLostReasonAnalysisQuery } from '../application/queries/get-lost-reason-analysis/get-lost-reason-analysis.query';
import { GetMyDashboardHandler } from '../application/queries/get-my-dashboard/get-my-dashboard.handler';
import { GetMyDashboardQuery } from '../application/queries/get-my-dashboard/get-my-dashboard.query';
import { GetReportExportsHandler } from '../application/queries/get-report-exports/get-report-exports.handler';
import { GetReportExportsQuery } from '../application/queries/get-report-exports/get-report-exports.query';
import { GetRevenueAnalyticsHandler } from '../application/queries/get-revenue-analytics/get-revenue-analytics.handler';
import { GetRevenueAnalyticsQuery } from '../application/queries/get-revenue-analytics/get-revenue-analytics.query';
import { GetSalesFunnelHandler } from '../application/queries/get-sales-funnel/get-sales-funnel.handler';
import { GetSalesFunnelQuery } from '../application/queries/get-sales-funnel/get-sales-funnel.query';
import { GetSalesPipelineHandler } from '../application/queries/get-sales-pipeline/get-sales-pipeline.handler';
import { GetSalesPipelineQuery } from '../application/queries/get-sales-pipeline/get-sales-pipeline.query';
import { GetTargetTrackingHandler } from '../application/queries/get-target-tracking/get-target-tracking.handler';
import { GetTargetTrackingQuery } from '../application/queries/get-target-tracking/get-target-tracking.query';
import { GetTeamPerformanceHandler } from '../application/queries/get-team-performance/get-team-performance.handler';
import { GetTeamPerformanceQuery } from '../application/queries/get-team-performance/get-team-performance.query';
import { GetVelocityMetricsHandler } from '../application/queries/get-velocity-metrics/get-velocity-metrics.handler';
import { GetVelocityMetricsQuery } from '../application/queries/get-velocity-metrics/get-velocity-metrics.query';

// ═══════════════════════════════════════════════════════════════════════════════
// CreateTargetHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CreateTargetHandler', () => {
  let handler: CreateTargetHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CreateTargetHandler(prisma);
  });

  it('should create a sales target', async () => {
    const result = await handler.execute(
      new CreateTargetCommand('DEALS_CLOSED', 50, 'MONTHLY', from, to, 'user-1', 'user-1', undefined, 'Q1 Target'),
    );
    expect(prisma.salesTarget.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ metric: 'DEALS_CLOSED', targetValue: 50 }) }),
    );
    expect(result.id).toBe('target-1');
  });

  it('should propagate DB error', async () => {
    prisma.salesTarget.create.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(
      new CreateTargetCommand('DEALS_CLOSED', 50, 'MONTHLY', from, to, 'user-1'),
    )).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DeleteTargetHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('DeleteTargetHandler', () => {
  let handler: DeleteTargetHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new DeleteTargetHandler(prisma);
  });

  it('should soft-delete (deactivate) target', async () => {
    const result = await handler.execute(new DeleteTargetCommand('target-1'));
    expect(prisma.salesTarget.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
    expect(result).toEqual({ deleted: true });
  });

  it('should throw NotFoundException when target not found', async () => {
    prisma.salesTarget.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new DeleteTargetCommand('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UpdateTargetHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UpdateTargetHandler', () => {
  let handler: UpdateTargetHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new UpdateTargetHandler(prisma);
  });

  it('should update target value and name', async () => {
    prisma.salesTarget.update.mockResolvedValue({ id: 'target-1', targetValue: 75, name: 'Q2 Target' });
    const result = await handler.execute(new UpdateTargetCommand('target-1', 75, 'Q2 Target'));
    expect(prisma.salesTarget.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ targetValue: 75, name: 'Q2 Target' }) }),
    );
  });

  it('should throw NotFoundException when target not found', async () => {
    prisma.salesTarget.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new UpdateTargetCommand('missing', 100))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB error', async () => {
    prisma.salesTarget.update.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new UpdateTargetCommand('target-1', 100))).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ExportReportHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('ExportReportHandler', () => {
  let handler: ExportReportHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ExportReportHandler(mockReportExportService as any);
  });

  it('should export a report and return URL', async () => {
    const result = await handler.execute(
      new ExportReportCommand('LEAD_REPORT', 'CSV', { dateFrom: from, dateTo: to }, 'user-1', 'Raj Patel'),
    );
    expect(mockReportExportService.exportReport).toHaveBeenCalledWith(
      expect.objectContaining({ reportType: 'LEAD_REPORT', format: 'CSV' }),
    );
    expect(result.url).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockReportExportService.exportReport.mockRejectedValue(new Error('export failed'));
    await expect(handler.execute(
      new ExportReportCommand('LEAD_REPORT', 'CSV', {}, 'user-1', 'Raj'),
    )).rejects.toThrow('export failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetActivityHeatmapHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetActivityHeatmapHandler', () => {
  let handler: GetActivityHeatmapHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetActivityHeatmapHandler(mockActivityAnalytics as any);
  });

  it('should return activity heatmap data', async () => {
    const result = await handler.execute(new GetActivityHeatmapQuery(from, to, 'user-1'));
    expect(mockActivityAnalytics.getActivityHeatmap).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: from, dateTo: to, userId: 'user-1' }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockActivityAnalytics.getActivityHeatmap.mockRejectedValue(new Error('analytics error'));
    await expect(handler.execute(new GetActivityHeatmapQuery(from, to))).rejects.toThrow('analytics error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetAgingAnalysisHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetAgingAnalysisHandler', () => {
  let handler: GetAgingAnalysisHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetAgingAnalysisHandler(mockRevenueAnalytics as any);
  });

  it('should return aging analysis', async () => {
    const result = await handler.execute(new GetAgingAnalysisQuery('user-1'));
    expect(mockRevenueAnalytics.getAgingAnalysis).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockRevenueAnalytics.getAgingAnalysis.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetAgingAnalysisQuery())).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetExecutiveDashboardHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetExecutiveDashboardHandler', () => {
  let handler: GetExecutiveDashboardHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetExecutiveDashboardHandler(mockDashboardAggregator as any);
  });

  it('should return executive dashboard data', async () => {
    const result = await handler.execute(new GetExecutiveDashboardQuery(from, to, 'user-1'));
    expect(mockDashboardAggregator.getExecutiveDashboard).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: from, dateTo: to }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockDashboardAggregator.getExecutiveDashboard.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetExecutiveDashboardQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetLeadSourceAnalysisHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetLeadSourceAnalysisHandler', () => {
  let handler: GetLeadSourceAnalysisHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetLeadSourceAnalysisHandler(mockRevenueAnalytics as any);
  });

  it('should return lead source analysis', async () => {
    const result = await handler.execute(new GetLeadSourceAnalysisQuery(from, to));
    expect(mockRevenueAnalytics.getLeadSourceAnalysis).toHaveBeenCalledWith({ dateFrom: from, dateTo: to });
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockRevenueAnalytics.getLeadSourceAnalysis.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetLeadSourceAnalysisQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetLeaderboardHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetLeaderboardHandler', () => {
  let handler: GetLeaderboardHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetLeaderboardHandler(mockTeamPerformance as any);
  });

  it('should return leaderboard rankings', async () => {
    const result = await handler.execute(new GetLeaderboardQuery(from, to, 'DEALS_CLOSED', 10, 'user-1'));
    expect(mockTeamPerformance.getLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ metric: 'DEALS_CLOSED', limit: 10 }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockTeamPerformance.getLeaderboard.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetLeaderboardQuery(from, to, 'DEALS_CLOSED'))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetLostReasonAnalysisHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetLostReasonAnalysisHandler', () => {
  let handler: GetLostReasonAnalysisHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetLostReasonAnalysisHandler(mockRevenueAnalytics as any);
  });

  it('should return lost reason analysis', async () => {
    const result = await handler.execute(new GetLostReasonAnalysisQuery(from, to));
    expect(mockRevenueAnalytics.getLostReasonAnalysis).toHaveBeenCalledWith({ dateFrom: from, dateTo: to });
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockRevenueAnalytics.getLostReasonAnalysis.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetLostReasonAnalysisQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetMyDashboardHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetMyDashboardHandler', () => {
  let handler: GetMyDashboardHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetMyDashboardHandler(mockDashboardAggregator as any);
  });

  it('should return my dashboard for a user', async () => {
    const result = await handler.execute(new GetMyDashboardQuery('user-1'));
    expect(mockDashboardAggregator.getMyDashboard).toHaveBeenCalledWith('user-1');
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockDashboardAggregator.getMyDashboard.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetMyDashboardQuery('user-1'))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetReportExportsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetReportExportsHandler', () => {
  let handler: GetReportExportsHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetReportExportsHandler(mockReportExportService as any);
  });

  it('should return export history for user', async () => {
    const result = await handler.execute(new GetReportExportsQuery('user-1', 1, 10));
    expect(mockReportExportService.getExportHistory).toHaveBeenCalledWith('user-1', 1, 10);
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockReportExportService.getExportHistory.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetReportExportsQuery('user-1'))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetRevenueAnalyticsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetRevenueAnalyticsHandler', () => {
  let handler: GetRevenueAnalyticsHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetRevenueAnalyticsHandler(mockRevenueAnalytics as any);
  });

  it('should return revenue analytics', async () => {
    const result = await handler.execute(new GetRevenueAnalyticsQuery(from, to, 'MONTHLY'));
    expect(mockRevenueAnalytics.getRevenueAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: from, dateTo: to, groupBy: 'MONTHLY' }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockRevenueAnalytics.getRevenueAnalytics.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetRevenueAnalyticsQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetSalesFunnelHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetSalesFunnelHandler', () => {
  let handler: GetSalesFunnelHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetSalesFunnelHandler(mockPipelineService as any);
  });

  it('should return sales funnel data', async () => {
    const result = await handler.execute(new GetSalesFunnelQuery(from, to, 'user-1'));
    expect(mockPipelineService.getSalesFunnel).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: from, dateTo: to }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockPipelineService.getSalesFunnel.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetSalesFunnelQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetSalesPipelineHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetSalesPipelineHandler', () => {
  let handler: GetSalesPipelineHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetSalesPipelineHandler(mockPipelineService as any);
  });

  it('should return sales pipeline data', async () => {
    const result = await handler.execute(new GetSalesPipelineQuery(from, to));
    expect(mockPipelineService.getSalesPipeline).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockPipelineService.getSalesPipeline.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetSalesPipelineQuery())).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetTargetTrackingHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetTargetTrackingHandler', () => {
  let handler: GetTargetTrackingHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetTargetTrackingHandler(mockTargetCalculator as any);
  });

  it('should return target tracking data', async () => {
    const result = await handler.execute(new GetTargetTrackingQuery('MONTHLY', from, to));
    expect(mockTargetCalculator.getTargetTracking).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'MONTHLY' }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockTargetCalculator.getTargetTracking.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetTargetTrackingQuery())).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetTeamPerformanceHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetTeamPerformanceHandler', () => {
  let handler: GetTeamPerformanceHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetTeamPerformanceHandler(mockTeamPerformance as any);
  });

  it('should return team performance data', async () => {
    const result = await handler.execute(new GetTeamPerformanceQuery(from, to, 'role-1'));
    expect(mockTeamPerformance.getTeamPerformance).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: from, dateTo: to, roleId: 'role-1' }),
    );
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockTeamPerformance.getTeamPerformance.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetTeamPerformanceQuery(from, to))).rejects.toThrow('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetVelocityMetricsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetVelocityMetricsHandler', () => {
  let handler: GetVelocityMetricsHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetVelocityMetricsHandler(mockRevenueAnalytics as any);
  });

  it('should return velocity metrics', async () => {
    const result = await handler.execute(new GetVelocityMetricsQuery(from, to));
    expect(mockRevenueAnalytics.getVelocityMetrics).toHaveBeenCalledWith({ dateFrom: from, dateTo: to });
    expect(result).toBeDefined();
  });

  it('should propagate service error', async () => {
    mockRevenueAnalytics.getVelocityMetrics.mockRejectedValue(new Error('error'));
    await expect(handler.execute(new GetVelocityMetricsQuery(from, to))).rejects.toThrow('error');
  });
});
