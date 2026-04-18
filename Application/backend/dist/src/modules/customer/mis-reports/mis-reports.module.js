"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MisReportsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const dashboard_module_1 = require("../../customer/dashboard/dashboard.module");
const report_engine_service_1 = require("./infrastructure/report-engine.service");
const report_renderer_excel_service_1 = require("./infrastructure/report-renderer-excel.service");
const report_renderer_csv_service_1 = require("./infrastructure/report-renderer-csv.service");
const report_renderer_pdf_service_1 = require("./infrastructure/report-renderer-pdf.service");
const period_comparator_service_1 = require("./infrastructure/period-comparator.service");
const drill_down_service_1 = require("./infrastructure/drill-down.service");
const report_scheduler_service_1 = require("./infrastructure/report-scheduler.service");
const report_emailer_service_1 = require("./infrastructure/report-emailer.service");
const reports_controller_1 = require("./presentation/reports.controller");
const report_bookmarks_controller_1 = require("./presentation/report-bookmarks.controller");
const report_schedules_controller_1 = require("./presentation/report-schedules.controller");
const custom_report_controller_1 = require("./presentation/custom-report.controller");
const daily_digest_controller_1 = require("./presentation/daily-digest.controller");
const report_templates_controller_1 = require("./presentation/report-templates.controller");
const sales_summary_report_1 = require("./reports/sales/sales-summary.report");
const revenue_report_1 = require("./reports/sales/revenue.report");
const target_vs_achievement_report_1 = require("./reports/sales/target-vs-achievement.report");
const sales_forecast_report_1 = require("./reports/sales/sales-forecast.report");
const deal_velocity_report_1 = require("./reports/sales/deal-velocity.report");
const win_loss_analysis_report_1 = require("./reports/sales/win-loss-analysis.report");
const sales_trend_report_1 = require("./reports/sales/sales-trend.report");
const lead_funnel_report_1 = require("./reports/leads/lead-funnel.report");
const lead_source_analysis_report_1 = require("./reports/leads/lead-source-analysis.report");
const lead_aging_report_1 = require("./reports/leads/lead-aging.report");
const lead_status_breakdown_report_1 = require("./reports/leads/lead-status-breakdown.report");
const lead_allocation_report_1 = require("./reports/leads/lead-allocation.report");
const hot_leads_report_1 = require("./reports/leads/hot-leads.report");
const lead_quality_score_report_1 = require("./reports/leads/lead-quality-score.report");
const dead_lost_leads_report_1 = require("./reports/leads/dead-lost-leads.report");
const contact_growth_report_1 = require("./reports/contacts/contact-growth.report");
const contact_completeness_report_1 = require("./reports/contacts/contact-completeness.report");
const org_wise_revenue_report_1 = require("./reports/contacts/org-wise-revenue.report");
const industry_wise_analysis_report_1 = require("./reports/contacts/industry-wise-analysis.report");
const geographic_distribution_report_1 = require("./reports/contacts/geographic-distribution.report");
const duplicate_contacts_report_1 = require("./reports/contacts/duplicate-contacts.report");
const activity_summary_report_1 = require("./reports/activities/activity-summary.report");
const activity_heatmap_report_1 = require("./reports/activities/activity-heatmap.report");
const call_log_report_1 = require("./reports/activities/call-log.report");
const follow_up_compliance_report_1 = require("./reports/activities/follow-up-compliance.report");
const productivity_report_1 = require("./reports/activities/productivity.report");
const activity_vs_outcome_report_1 = require("./reports/activities/activity-vs-outcome.report");
const demo_summary_report_1 = require("./reports/demos/demo-summary.report");
const demo_conversion_report_1 = require("./reports/demos/demo-conversion.report");
const demo_calendar_report_1 = require("./reports/demos/demo-calendar.report");
const no_show_analysis_report_1 = require("./reports/demos/no-show-analysis.report");
const quotation_summary_report_1 = require("./reports/quotations/quotation-summary.report");
const quotation_aging_report_1 = require("./reports/quotations/quotation-aging.report");
const quotation_vs_order_report_1 = require("./reports/quotations/quotation-vs-order.report");
const product_wise_quotation_report_1 = require("./reports/quotations/product-wise-quotation.report");
const revision_history_report_1 = require("./reports/quotations/revision-history.report");
const tour_plan_compliance_report_1 = require("./reports/tour-plans/tour-plan-compliance.report");
const visit_outcome_report_1 = require("./reports/tour-plans/visit-outcome.report");
const field_team_tracker_report_1 = require("./reports/tour-plans/field-team-tracker.report");
const visit_to_conversion_report_1 = require("./reports/tour-plans/visit-to-conversion.report");
const individual_scorecard_report_1 = require("./reports/team/individual-scorecard.report");
const team_leaderboard_report_1 = require("./reports/team/team-leaderboard.report");
const workload_distribution_report_1 = require("./reports/team/workload-distribution.report");
const response_time_report_1 = require("./reports/team/response-time.report");
const new_joiner_ramp_up_report_1 = require("./reports/team/new-joiner-ramp-up.report");
const email_performance_report_1 = require("./reports/communications/email-performance.report");
const whatsapp_performance_report_1 = require("./reports/communications/whatsapp-performance.report");
const campaign_report_report_1 = require("./reports/communications/campaign-report.report");
const channel_effectiveness_report_1 = require("./reports/communications/channel-effectiveness.report");
const ceo_dashboard_report_1 = require("./reports/executive/ceo-dashboard.report");
const monthly_business_review_report_1 = require("./reports/executive/monthly-business-review.report");
const quarterly_business_review_report_1 = require("./reports/executive/quarterly-business-review.report");
const customer_concentration_report_1 = require("./reports/executive/customer-concentration.report");
const pipeline_health_report_1 = require("./reports/executive/pipeline-health.report");
const daily_digest_report_1 = require("./reports/executive/daily-digest.report");
const custom_report_report_1 = require("./reports/executive/custom-report.report");
const REPORT_CLASSES = [
    sales_summary_report_1.SalesSummaryReport, revenue_report_1.RevenueReport, target_vs_achievement_report_1.TargetVsAchievementReport,
    sales_forecast_report_1.SalesForecastReport, deal_velocity_report_1.DealVelocityReport, win_loss_analysis_report_1.WinLossAnalysisReport, sales_trend_report_1.SalesTrendReport,
    lead_funnel_report_1.LeadFunnelReport, lead_source_analysis_report_1.LeadSourceAnalysisReport, lead_aging_report_1.LeadAgingReport,
    lead_status_breakdown_report_1.LeadStatusBreakdownReport, lead_allocation_report_1.LeadAllocationReport, hot_leads_report_1.HotLeadsReport,
    lead_quality_score_report_1.LeadQualityScoreReport, dead_lost_leads_report_1.DeadLostLeadsReport,
    contact_growth_report_1.ContactGrowthReport, contact_completeness_report_1.ContactCompletenessReport, org_wise_revenue_report_1.OrgWiseRevenueReport,
    industry_wise_analysis_report_1.IndustryWiseAnalysisReport, geographic_distribution_report_1.GeographicDistributionReport, duplicate_contacts_report_1.DuplicateContactsReport,
    activity_summary_report_1.ActivitySummaryReport, activity_heatmap_report_1.ActivityHeatmapReport, call_log_report_1.CallLogReport,
    follow_up_compliance_report_1.FollowUpComplianceReport, productivity_report_1.ProductivityReport, activity_vs_outcome_report_1.ActivityVsOutcomeReport,
    demo_summary_report_1.DemoSummaryReport, demo_conversion_report_1.DemoConversionReport, demo_calendar_report_1.DemoCalendarReport, no_show_analysis_report_1.NoShowAnalysisReport,
    quotation_summary_report_1.QuotationSummaryReport, quotation_aging_report_1.QuotationAgingReport, quotation_vs_order_report_1.QuotationVsOrderReport,
    product_wise_quotation_report_1.ProductWiseQuotationReport, revision_history_report_1.RevisionHistoryReport,
    tour_plan_compliance_report_1.TourPlanComplianceReport, visit_outcome_report_1.VisitOutcomeReport, field_team_tracker_report_1.FieldTeamTrackerReport, visit_to_conversion_report_1.VisitToConversionReport,
    individual_scorecard_report_1.IndividualScorecardReport, team_leaderboard_report_1.TeamLeaderboardReport, workload_distribution_report_1.WorkloadDistributionReport,
    response_time_report_1.ResponseTimeReport, new_joiner_ramp_up_report_1.NewJoinerRampUpReport,
    email_performance_report_1.EmailPerformanceReport, whatsapp_performance_report_1.WhatsAppPerformanceReport, campaign_report_report_1.CampaignReport, channel_effectiveness_report_1.ChannelEffectivenessReport,
    ceo_dashboard_report_1.CeoDashboardReport, monthly_business_review_report_1.MonthlyBusinessReviewReport, quarterly_business_review_report_1.QuarterlyBusinessReviewReport,
    customer_concentration_report_1.CustomerConcentrationReport, pipeline_health_report_1.PipelineHealthReport, daily_digest_report_1.DailyDigestReport,
    custom_report_report_1.CustomReportReport,
];
let MisReportsModule = class MisReportsModule {
    constructor(engine, salesSummary, revenue, targetVsAchievement, salesForecast, dealVelocity, winLoss, salesTrend, leadFunnel, leadSource, leadAging, leadStatus, leadAllocation, hotLeads, leadQuality, deadLost, contactGrowth, contactCompleteness, orgRevenue, industryAnalysis, geographic, duplicateContacts, activitySummary, activityHeatmap, callLog, followUp, productivity, activityOutcome, demoSummary, demoConversion, demoCalendar, noShow, quotationSummary, quotationAging, quotationVsOrder, productWiseQuotation, revisionHistory, tourPlanCompliance, visitOutcome, fieldTeamTracker, visitToConversion, individualScorecard, teamLeaderboard, workloadDistribution, responseTime, newJoinerRampUp, emailPerformance, whatsappPerformance, campaign, channelEffectiveness, ceoDashboard, monthlyBusinessReview, quarterlyBusinessReview, customerConcentration, pipelineHealth, dailyDigest, customReport) {
        this.engine = engine;
        this.salesSummary = salesSummary;
        this.revenue = revenue;
        this.targetVsAchievement = targetVsAchievement;
        this.salesForecast = salesForecast;
        this.dealVelocity = dealVelocity;
        this.winLoss = winLoss;
        this.salesTrend = salesTrend;
        this.leadFunnel = leadFunnel;
        this.leadSource = leadSource;
        this.leadAging = leadAging;
        this.leadStatus = leadStatus;
        this.leadAllocation = leadAllocation;
        this.hotLeads = hotLeads;
        this.leadQuality = leadQuality;
        this.deadLost = deadLost;
        this.contactGrowth = contactGrowth;
        this.contactCompleteness = contactCompleteness;
        this.orgRevenue = orgRevenue;
        this.industryAnalysis = industryAnalysis;
        this.geographic = geographic;
        this.duplicateContacts = duplicateContacts;
        this.activitySummary = activitySummary;
        this.activityHeatmap = activityHeatmap;
        this.callLog = callLog;
        this.followUp = followUp;
        this.productivity = productivity;
        this.activityOutcome = activityOutcome;
        this.demoSummary = demoSummary;
        this.demoConversion = demoConversion;
        this.demoCalendar = demoCalendar;
        this.noShow = noShow;
        this.quotationSummary = quotationSummary;
        this.quotationAging = quotationAging;
        this.quotationVsOrder = quotationVsOrder;
        this.productWiseQuotation = productWiseQuotation;
        this.revisionHistory = revisionHistory;
        this.tourPlanCompliance = tourPlanCompliance;
        this.visitOutcome = visitOutcome;
        this.fieldTeamTracker = fieldTeamTracker;
        this.visitToConversion = visitToConversion;
        this.individualScorecard = individualScorecard;
        this.teamLeaderboard = teamLeaderboard;
        this.workloadDistribution = workloadDistribution;
        this.responseTime = responseTime;
        this.newJoinerRampUp = newJoinerRampUp;
        this.emailPerformance = emailPerformance;
        this.whatsappPerformance = whatsappPerformance;
        this.campaign = campaign;
        this.channelEffectiveness = channelEffectiveness;
        this.ceoDashboard = ceoDashboard;
        this.monthlyBusinessReview = monthlyBusinessReview;
        this.quarterlyBusinessReview = quarterlyBusinessReview;
        this.customerConcentration = customerConcentration;
        this.pipelineHealth = pipelineHealth;
        this.dailyDigest = dailyDigest;
        this.customReport = customReport;
    }
    onModuleInit() {
        const reports = [
            this.salesSummary, this.revenue, this.targetVsAchievement,
            this.salesForecast, this.dealVelocity, this.winLoss, this.salesTrend,
            this.leadFunnel, this.leadSource, this.leadAging,
            this.leadStatus, this.leadAllocation, this.hotLeads,
            this.leadQuality, this.deadLost,
            this.contactGrowth, this.contactCompleteness, this.orgRevenue,
            this.industryAnalysis, this.geographic, this.duplicateContacts,
            this.activitySummary, this.activityHeatmap, this.callLog,
            this.followUp, this.productivity, this.activityOutcome,
            this.demoSummary, this.demoConversion, this.demoCalendar, this.noShow,
            this.quotationSummary, this.quotationAging, this.quotationVsOrder,
            this.productWiseQuotation, this.revisionHistory,
            this.tourPlanCompliance, this.visitOutcome,
            this.fieldTeamTracker, this.visitToConversion,
            this.individualScorecard, this.teamLeaderboard,
            this.workloadDistribution, this.responseTime, this.newJoinerRampUp,
            this.emailPerformance, this.whatsappPerformance,
            this.campaign, this.channelEffectiveness,
            this.ceoDashboard, this.monthlyBusinessReview, this.quarterlyBusinessReview,
            this.customerConcentration, this.pipelineHealth, this.dailyDigest,
            this.customReport,
        ];
        for (const report of reports) {
            this.engine.registerReport(report);
        }
    }
};
exports.MisReportsModule = MisReportsModule;
exports.MisReportsModule = MisReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule, dashboard_module_1.DashboardModule],
        controllers: [
            reports_controller_1.MisReportsController,
            report_bookmarks_controller_1.ReportBookmarksController,
            report_schedules_controller_1.ReportSchedulesController,
            report_templates_controller_1.ReportTemplatesController,
            custom_report_controller_1.CustomReportController,
            daily_digest_controller_1.DailyDigestController,
        ],
        providers: [
            report_engine_service_1.ReportEngineService,
            report_renderer_excel_service_1.ReportRendererExcelService,
            report_renderer_csv_service_1.ReportRendererCsvService,
            report_renderer_pdf_service_1.ReportRendererPdfService,
            period_comparator_service_1.PeriodComparatorService,
            drill_down_service_1.DrillDownService,
            report_scheduler_service_1.ReportSchedulerService,
            report_emailer_service_1.ReportEmailerService,
            ...REPORT_CLASSES,
        ],
        exports: [report_engine_service_1.ReportEngineService],
    }),
    __metadata("design:paramtypes", [report_engine_service_1.ReportEngineService,
        sales_summary_report_1.SalesSummaryReport,
        revenue_report_1.RevenueReport,
        target_vs_achievement_report_1.TargetVsAchievementReport,
        sales_forecast_report_1.SalesForecastReport,
        deal_velocity_report_1.DealVelocityReport,
        win_loss_analysis_report_1.WinLossAnalysisReport,
        sales_trend_report_1.SalesTrendReport,
        lead_funnel_report_1.LeadFunnelReport,
        lead_source_analysis_report_1.LeadSourceAnalysisReport,
        lead_aging_report_1.LeadAgingReport,
        lead_status_breakdown_report_1.LeadStatusBreakdownReport,
        lead_allocation_report_1.LeadAllocationReport,
        hot_leads_report_1.HotLeadsReport,
        lead_quality_score_report_1.LeadQualityScoreReport,
        dead_lost_leads_report_1.DeadLostLeadsReport,
        contact_growth_report_1.ContactGrowthReport,
        contact_completeness_report_1.ContactCompletenessReport,
        org_wise_revenue_report_1.OrgWiseRevenueReport,
        industry_wise_analysis_report_1.IndustryWiseAnalysisReport,
        geographic_distribution_report_1.GeographicDistributionReport,
        duplicate_contacts_report_1.DuplicateContactsReport,
        activity_summary_report_1.ActivitySummaryReport,
        activity_heatmap_report_1.ActivityHeatmapReport,
        call_log_report_1.CallLogReport,
        follow_up_compliance_report_1.FollowUpComplianceReport,
        productivity_report_1.ProductivityReport,
        activity_vs_outcome_report_1.ActivityVsOutcomeReport,
        demo_summary_report_1.DemoSummaryReport,
        demo_conversion_report_1.DemoConversionReport,
        demo_calendar_report_1.DemoCalendarReport,
        no_show_analysis_report_1.NoShowAnalysisReport,
        quotation_summary_report_1.QuotationSummaryReport,
        quotation_aging_report_1.QuotationAgingReport,
        quotation_vs_order_report_1.QuotationVsOrderReport,
        product_wise_quotation_report_1.ProductWiseQuotationReport,
        revision_history_report_1.RevisionHistoryReport,
        tour_plan_compliance_report_1.TourPlanComplianceReport,
        visit_outcome_report_1.VisitOutcomeReport,
        field_team_tracker_report_1.FieldTeamTrackerReport,
        visit_to_conversion_report_1.VisitToConversionReport,
        individual_scorecard_report_1.IndividualScorecardReport,
        team_leaderboard_report_1.TeamLeaderboardReport,
        workload_distribution_report_1.WorkloadDistributionReport,
        response_time_report_1.ResponseTimeReport,
        new_joiner_ramp_up_report_1.NewJoinerRampUpReport,
        email_performance_report_1.EmailPerformanceReport,
        whatsapp_performance_report_1.WhatsAppPerformanceReport,
        campaign_report_report_1.CampaignReport,
        channel_effectiveness_report_1.ChannelEffectivenessReport,
        ceo_dashboard_report_1.CeoDashboardReport,
        monthly_business_review_report_1.MonthlyBusinessReviewReport,
        quarterly_business_review_report_1.QuarterlyBusinessReviewReport,
        customer_concentration_report_1.CustomerConcentrationReport,
        pipeline_health_report_1.PipelineHealthReport,
        daily_digest_report_1.DailyDigestReport,
        custom_report_report_1.CustomReportReport])
], MisReportsModule);
//# sourceMappingURL=mis-reports.module.js.map