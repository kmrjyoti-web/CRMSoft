import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Services
import { DashboardAggregatorService } from './services/dashboard-aggregator.service';
import { PipelineService } from './services/pipeline.service';
import { ActivityAnalyticsService } from './services/activity-analytics.service';
import { TeamPerformanceService } from './services/team-performance.service';
import { RevenueAnalyticsService } from './services/revenue-analytics.service';
import { ReportExportService } from './services/report-export.service';
import { TargetCalculatorService } from './services/target-calculator.service';

// Controllers
import { DashboardController } from './presentation/dashboard.controller';
import { AnalyticsController } from './presentation/analytics.controller';
import { PerformanceController } from './presentation/performance.controller';
import { ReportsController } from './presentation/reports.controller';

// Command Handlers
import { CreateTargetHandler } from './application/commands/create-target/create-target.handler';
import { UpdateTargetHandler } from './application/commands/update-target/update-target.handler';
import { DeleteTargetHandler } from './application/commands/delete-target/delete-target.handler';
import { ExportReportHandler } from './application/commands/export-report/export-report.handler';

// Query Handlers
import { GetExecutiveDashboardHandler } from './application/queries/get-executive-dashboard/get-executive-dashboard.handler';
import { GetSalesPipelineHandler } from './application/queries/get-sales-pipeline/get-sales-pipeline.handler';
import { GetSalesFunnelHandler } from './application/queries/get-sales-funnel/get-sales-funnel.handler';
import { GetActivityHeatmapHandler } from './application/queries/get-activity-heatmap/get-activity-heatmap.handler';
import { GetTeamPerformanceHandler } from './application/queries/get-team-performance/get-team-performance.handler';
import { GetLeaderboardHandler } from './application/queries/get-leaderboard/get-leaderboard.handler';
import { GetTargetTrackingHandler } from './application/queries/get-target-tracking/get-target-tracking.handler';
import { GetRevenueAnalyticsHandler } from './application/queries/get-revenue-analytics/get-revenue-analytics.handler';
import { GetLeadSourceAnalysisHandler } from './application/queries/get-lead-source-analysis/get-lead-source-analysis.handler';
import { GetLostReasonAnalysisHandler } from './application/queries/get-lost-reason-analysis/get-lost-reason-analysis.handler';
import { GetAgingAnalysisHandler } from './application/queries/get-aging-analysis/get-aging-analysis.handler';
import { GetVelocityMetricsHandler } from './application/queries/get-velocity-metrics/get-velocity-metrics.handler';
import { GetMyDashboardHandler } from './application/queries/get-my-dashboard/get-my-dashboard.handler';
import { GetReportExportsHandler } from './application/queries/get-report-exports/get-report-exports.handler';

const CommandHandlers = [
  CreateTargetHandler,
  UpdateTargetHandler,
  DeleteTargetHandler,
  ExportReportHandler,
];

const QueryHandlers = [
  GetExecutiveDashboardHandler,
  GetSalesPipelineHandler,
  GetSalesFunnelHandler,
  GetActivityHeatmapHandler,
  GetTeamPerformanceHandler,
  GetLeaderboardHandler,
  GetTargetTrackingHandler,
  GetRevenueAnalyticsHandler,
  GetLeadSourceAnalysisHandler,
  GetLostReasonAnalysisHandler,
  GetAgingAnalysisHandler,
  GetVelocityMetricsHandler,
  GetMyDashboardHandler,
  GetReportExportsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [DashboardController, AnalyticsController, PerformanceController, ReportsController],
  providers: [
    DashboardAggregatorService,
    PipelineService,
    ActivityAnalyticsService,
    TeamPerformanceService,
    RevenueAnalyticsService,
    ReportExportService,
    TargetCalculatorService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    DashboardAggregatorService,
    PipelineService,
    RevenueAnalyticsService,
    ActivityAnalyticsService,
    TeamPerformanceService,
    TargetCalculatorService,
    ReportExportService,
  ],
})
export class DashboardModule {}
