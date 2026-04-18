"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const dashboard_aggregator_service_1 = require("./services/dashboard-aggregator.service");
const pipeline_service_1 = require("./services/pipeline.service");
const activity_analytics_service_1 = require("./services/activity-analytics.service");
const team_performance_service_1 = require("./services/team-performance.service");
const revenue_analytics_service_1 = require("./services/revenue-analytics.service");
const report_export_service_1 = require("./services/report-export.service");
const target_calculator_service_1 = require("./services/target-calculator.service");
const dashboard_controller_1 = require("./presentation/dashboard.controller");
const analytics_controller_1 = require("./presentation/analytics.controller");
const performance_controller_1 = require("./presentation/performance.controller");
const reports_controller_1 = require("./presentation/reports.controller");
const create_target_handler_1 = require("./application/commands/create-target/create-target.handler");
const update_target_handler_1 = require("./application/commands/update-target/update-target.handler");
const delete_target_handler_1 = require("./application/commands/delete-target/delete-target.handler");
const export_report_handler_1 = require("./application/commands/export-report/export-report.handler");
const get_executive_dashboard_handler_1 = require("./application/queries/get-executive-dashboard/get-executive-dashboard.handler");
const get_sales_pipeline_handler_1 = require("./application/queries/get-sales-pipeline/get-sales-pipeline.handler");
const get_sales_funnel_handler_1 = require("./application/queries/get-sales-funnel/get-sales-funnel.handler");
const get_activity_heatmap_handler_1 = require("./application/queries/get-activity-heatmap/get-activity-heatmap.handler");
const get_team_performance_handler_1 = require("./application/queries/get-team-performance/get-team-performance.handler");
const get_leaderboard_handler_1 = require("./application/queries/get-leaderboard/get-leaderboard.handler");
const get_target_tracking_handler_1 = require("./application/queries/get-target-tracking/get-target-tracking.handler");
const get_revenue_analytics_handler_1 = require("./application/queries/get-revenue-analytics/get-revenue-analytics.handler");
const get_lead_source_analysis_handler_1 = require("./application/queries/get-lead-source-analysis/get-lead-source-analysis.handler");
const get_lost_reason_analysis_handler_1 = require("./application/queries/get-lost-reason-analysis/get-lost-reason-analysis.handler");
const get_aging_analysis_handler_1 = require("./application/queries/get-aging-analysis/get-aging-analysis.handler");
const get_velocity_metrics_handler_1 = require("./application/queries/get-velocity-metrics/get-velocity-metrics.handler");
const get_my_dashboard_handler_1 = require("./application/queries/get-my-dashboard/get-my-dashboard.handler");
const get_report_exports_handler_1 = require("./application/queries/get-report-exports/get-report-exports.handler");
const CommandHandlers = [
    create_target_handler_1.CreateTargetHandler,
    update_target_handler_1.UpdateTargetHandler,
    delete_target_handler_1.DeleteTargetHandler,
    export_report_handler_1.ExportReportHandler,
];
const QueryHandlers = [
    get_executive_dashboard_handler_1.GetExecutiveDashboardHandler,
    get_sales_pipeline_handler_1.GetSalesPipelineHandler,
    get_sales_funnel_handler_1.GetSalesFunnelHandler,
    get_activity_heatmap_handler_1.GetActivityHeatmapHandler,
    get_team_performance_handler_1.GetTeamPerformanceHandler,
    get_leaderboard_handler_1.GetLeaderboardHandler,
    get_target_tracking_handler_1.GetTargetTrackingHandler,
    get_revenue_analytics_handler_1.GetRevenueAnalyticsHandler,
    get_lead_source_analysis_handler_1.GetLeadSourceAnalysisHandler,
    get_lost_reason_analysis_handler_1.GetLostReasonAnalysisHandler,
    get_aging_analysis_handler_1.GetAgingAnalysisHandler,
    get_velocity_metrics_handler_1.GetVelocityMetricsHandler,
    get_my_dashboard_handler_1.GetMyDashboardHandler,
    get_report_exports_handler_1.GetReportExportsHandler,
];
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [dashboard_controller_1.DashboardController, analytics_controller_1.AnalyticsController, performance_controller_1.PerformanceController, reports_controller_1.ReportsController],
        providers: [
            dashboard_aggregator_service_1.DashboardAggregatorService,
            pipeline_service_1.PipelineService,
            activity_analytics_service_1.ActivityAnalyticsService,
            team_performance_service_1.TeamPerformanceService,
            revenue_analytics_service_1.RevenueAnalyticsService,
            report_export_service_1.ReportExportService,
            target_calculator_service_1.TargetCalculatorService,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            dashboard_aggregator_service_1.DashboardAggregatorService,
            pipeline_service_1.PipelineService,
            revenue_analytics_service_1.RevenueAnalyticsService,
            activity_analytics_service_1.ActivityAnalyticsService,
            team_performance_service_1.TeamPerformanceService,
            target_calculator_service_1.TargetCalculatorService,
            report_export_service_1.ReportExportService,
        ],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map