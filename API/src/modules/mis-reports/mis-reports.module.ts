import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from '../dashboard/dashboard.module';

// Infrastructure
import { ReportEngineService } from './infrastructure/report-engine.service';
import { ReportRendererExcelService } from './infrastructure/report-renderer-excel.service';
import { ReportRendererCsvService } from './infrastructure/report-renderer-csv.service';
import { ReportRendererPdfService } from './infrastructure/report-renderer-pdf.service';
import { PeriodComparatorService } from './infrastructure/period-comparator.service';
import { DrillDownService } from './infrastructure/drill-down.service';
import { ReportSchedulerService } from './infrastructure/report-scheduler.service';
import { ReportEmailerService } from './infrastructure/report-emailer.service';

// Controllers
import { MisReportsController } from './presentation/reports.controller';
import { ReportBookmarksController } from './presentation/report-bookmarks.controller';
import { ReportSchedulesController } from './presentation/report-schedules.controller';
import { CustomReportController } from './presentation/custom-report.controller';
import { DailyDigestController } from './presentation/daily-digest.controller';
import { ReportTemplatesController } from './presentation/report-templates.controller';

// Sales Reports
import { SalesSummaryReport } from './reports/sales/sales-summary.report';
import { RevenueReport } from './reports/sales/revenue.report';
import { TargetVsAchievementReport } from './reports/sales/target-vs-achievement.report';
import { SalesForecastReport } from './reports/sales/sales-forecast.report';
import { DealVelocityReport } from './reports/sales/deal-velocity.report';
import { WinLossAnalysisReport } from './reports/sales/win-loss-analysis.report';
import { SalesTrendReport } from './reports/sales/sales-trend.report';

// Lead Reports
import { LeadFunnelReport } from './reports/leads/lead-funnel.report';
import { LeadSourceAnalysisReport } from './reports/leads/lead-source-analysis.report';
import { LeadAgingReport } from './reports/leads/lead-aging.report';
import { LeadStatusBreakdownReport } from './reports/leads/lead-status-breakdown.report';
import { LeadAllocationReport } from './reports/leads/lead-allocation.report';
import { HotLeadsReport } from './reports/leads/hot-leads.report';
import { LeadQualityScoreReport } from './reports/leads/lead-quality-score.report';
import { DeadLostLeadsReport } from './reports/leads/dead-lost-leads.report';

// Contact Reports
import { ContactGrowthReport } from './reports/contacts/contact-growth.report';
import { ContactCompletenessReport } from './reports/contacts/contact-completeness.report';
import { OrgWiseRevenueReport } from './reports/contacts/org-wise-revenue.report';
import { IndustryWiseAnalysisReport } from './reports/contacts/industry-wise-analysis.report';
import { GeographicDistributionReport } from './reports/contacts/geographic-distribution.report';
import { DuplicateContactsReport } from './reports/contacts/duplicate-contacts.report';

// Activity Reports
import { ActivitySummaryReport } from './reports/activities/activity-summary.report';
import { ActivityHeatmapReport } from './reports/activities/activity-heatmap.report';
import { CallLogReport } from './reports/activities/call-log.report';
import { FollowUpComplianceReport } from './reports/activities/follow-up-compliance.report';
import { ProductivityReport } from './reports/activities/productivity.report';
import { ActivityVsOutcomeReport } from './reports/activities/activity-vs-outcome.report';

// Demo Reports
import { DemoSummaryReport } from './reports/demos/demo-summary.report';
import { DemoConversionReport } from './reports/demos/demo-conversion.report';
import { DemoCalendarReport } from './reports/demos/demo-calendar.report';
import { NoShowAnalysisReport } from './reports/demos/no-show-analysis.report';

// Quotation Reports
import { QuotationSummaryReport } from './reports/quotations/quotation-summary.report';
import { QuotationAgingReport } from './reports/quotations/quotation-aging.report';
import { QuotationVsOrderReport } from './reports/quotations/quotation-vs-order.report';
import { ProductWiseQuotationReport } from './reports/quotations/product-wise-quotation.report';
import { RevisionHistoryReport } from './reports/quotations/revision-history.report';

// Tour Plan Reports
import { TourPlanComplianceReport } from './reports/tour-plans/tour-plan-compliance.report';
import { VisitOutcomeReport } from './reports/tour-plans/visit-outcome.report';
import { FieldTeamTrackerReport } from './reports/tour-plans/field-team-tracker.report';
import { VisitToConversionReport } from './reports/tour-plans/visit-to-conversion.report';

// Team Reports
import { IndividualScorecardReport } from './reports/team/individual-scorecard.report';
import { TeamLeaderboardReport } from './reports/team/team-leaderboard.report';
import { WorkloadDistributionReport } from './reports/team/workload-distribution.report';
import { ResponseTimeReport } from './reports/team/response-time.report';
import { NewJoinerRampUpReport } from './reports/team/new-joiner-ramp-up.report';

// Communication Reports
import { EmailPerformanceReport } from './reports/communications/email-performance.report';
import { WhatsAppPerformanceReport } from './reports/communications/whatsapp-performance.report';
import { CampaignReport } from './reports/communications/campaign-report.report';
import { ChannelEffectivenessReport } from './reports/communications/channel-effectiveness.report';

// Executive Reports
import { CeoDashboardReport } from './reports/executive/ceo-dashboard.report';
import { MonthlyBusinessReviewReport } from './reports/executive/monthly-business-review.report';
import { QuarterlyBusinessReviewReport } from './reports/executive/quarterly-business-review.report';
import { CustomerConcentrationReport } from './reports/executive/customer-concentration.report';
import { PipelineHealthReport } from './reports/executive/pipeline-health.report';
import { DailyDigestReport } from './reports/executive/daily-digest.report';
import { CustomReportReport } from './reports/executive/custom-report.report';

const REPORT_CLASSES = [
  // Sales (7)
  SalesSummaryReport, RevenueReport, TargetVsAchievementReport,
  SalesForecastReport, DealVelocityReport, WinLossAnalysisReport, SalesTrendReport,
  // Leads (8)
  LeadFunnelReport, LeadSourceAnalysisReport, LeadAgingReport,
  LeadStatusBreakdownReport, LeadAllocationReport, HotLeadsReport,
  LeadQualityScoreReport, DeadLostLeadsReport,
  // Contacts (6)
  ContactGrowthReport, ContactCompletenessReport, OrgWiseRevenueReport,
  IndustryWiseAnalysisReport, GeographicDistributionReport, DuplicateContactsReport,
  // Activities (6)
  ActivitySummaryReport, ActivityHeatmapReport, CallLogReport,
  FollowUpComplianceReport, ProductivityReport, ActivityVsOutcomeReport,
  // Demos (4)
  DemoSummaryReport, DemoConversionReport, DemoCalendarReport, NoShowAnalysisReport,
  // Quotations (5)
  QuotationSummaryReport, QuotationAgingReport, QuotationVsOrderReport,
  ProductWiseQuotationReport, RevisionHistoryReport,
  // Tour Plans (4)
  TourPlanComplianceReport, VisitOutcomeReport, FieldTeamTrackerReport, VisitToConversionReport,
  // Team (5)
  IndividualScorecardReport, TeamLeaderboardReport, WorkloadDistributionReport,
  ResponseTimeReport, NewJoinerRampUpReport,
  // Communications (4)
  EmailPerformanceReport, WhatsAppPerformanceReport, CampaignReport, ChannelEffectivenessReport,
  // Executive (6)
  CeoDashboardReport, MonthlyBusinessReviewReport, QuarterlyBusinessReviewReport,
  CustomerConcentrationReport, PipelineHealthReport, DailyDigestReport,
  // Custom (1)
  CustomReportReport,
];

@Module({
  imports: [ScheduleModule, DashboardModule],
  controllers: [
    MisReportsController,
    ReportBookmarksController,
    ReportSchedulesController,
    ReportTemplatesController,
    CustomReportController,
    DailyDigestController,
  ],
  providers: [
    // Infrastructure
    ReportEngineService,
    ReportRendererExcelService,
    ReportRendererCsvService,
    ReportRendererPdfService,
    PeriodComparatorService,
    DrillDownService,
    ReportSchedulerService,
    ReportEmailerService,
    // All 56 Reports
    ...REPORT_CLASSES,
  ],
  exports: [ReportEngineService],
})
export class MisReportsModule implements OnModuleInit {
  constructor(
    private readonly engine: ReportEngineService,
    // Sales
    private readonly salesSummary: SalesSummaryReport,
    private readonly revenue: RevenueReport,
    private readonly targetVsAchievement: TargetVsAchievementReport,
    private readonly salesForecast: SalesForecastReport,
    private readonly dealVelocity: DealVelocityReport,
    private readonly winLoss: WinLossAnalysisReport,
    private readonly salesTrend: SalesTrendReport,
    // Leads
    private readonly leadFunnel: LeadFunnelReport,
    private readonly leadSource: LeadSourceAnalysisReport,
    private readonly leadAging: LeadAgingReport,
    private readonly leadStatus: LeadStatusBreakdownReport,
    private readonly leadAllocation: LeadAllocationReport,
    private readonly hotLeads: HotLeadsReport,
    private readonly leadQuality: LeadQualityScoreReport,
    private readonly deadLost: DeadLostLeadsReport,
    // Contacts
    private readonly contactGrowth: ContactGrowthReport,
    private readonly contactCompleteness: ContactCompletenessReport,
    private readonly orgRevenue: OrgWiseRevenueReport,
    private readonly industryAnalysis: IndustryWiseAnalysisReport,
    private readonly geographic: GeographicDistributionReport,
    private readonly duplicateContacts: DuplicateContactsReport,
    // Activities
    private readonly activitySummary: ActivitySummaryReport,
    private readonly activityHeatmap: ActivityHeatmapReport,
    private readonly callLog: CallLogReport,
    private readonly followUp: FollowUpComplianceReport,
    private readonly productivity: ProductivityReport,
    private readonly activityOutcome: ActivityVsOutcomeReport,
    // Demos
    private readonly demoSummary: DemoSummaryReport,
    private readonly demoConversion: DemoConversionReport,
    private readonly demoCalendar: DemoCalendarReport,
    private readonly noShow: NoShowAnalysisReport,
    // Quotations
    private readonly quotationSummary: QuotationSummaryReport,
    private readonly quotationAging: QuotationAgingReport,
    private readonly quotationVsOrder: QuotationVsOrderReport,
    private readonly productWiseQuotation: ProductWiseQuotationReport,
    private readonly revisionHistory: RevisionHistoryReport,
    // Tour Plans
    private readonly tourPlanCompliance: TourPlanComplianceReport,
    private readonly visitOutcome: VisitOutcomeReport,
    private readonly fieldTeamTracker: FieldTeamTrackerReport,
    private readonly visitToConversion: VisitToConversionReport,
    // Team
    private readonly individualScorecard: IndividualScorecardReport,
    private readonly teamLeaderboard: TeamLeaderboardReport,
    private readonly workloadDistribution: WorkloadDistributionReport,
    private readonly responseTime: ResponseTimeReport,
    private readonly newJoinerRampUp: NewJoinerRampUpReport,
    // Communications
    private readonly emailPerformance: EmailPerformanceReport,
    private readonly whatsappPerformance: WhatsAppPerformanceReport,
    private readonly campaign: CampaignReport,
    private readonly channelEffectiveness: ChannelEffectivenessReport,
    // Executive
    private readonly ceoDashboard: CeoDashboardReport,
    private readonly monthlyBusinessReview: MonthlyBusinessReviewReport,
    private readonly quarterlyBusinessReview: QuarterlyBusinessReviewReport,
    private readonly customerConcentration: CustomerConcentrationReport,
    private readonly pipelineHealth: PipelineHealthReport,
    private readonly dailyDigest: DailyDigestReport,
    // Custom
    private readonly customReport: CustomReportReport,
  ) {}

  onModuleInit() {
    const reports = [
      // Sales
      this.salesSummary, this.revenue, this.targetVsAchievement,
      this.salesForecast, this.dealVelocity, this.winLoss, this.salesTrend,
      // Leads
      this.leadFunnel, this.leadSource, this.leadAging,
      this.leadStatus, this.leadAllocation, this.hotLeads,
      this.leadQuality, this.deadLost,
      // Contacts
      this.contactGrowth, this.contactCompleteness, this.orgRevenue,
      this.industryAnalysis, this.geographic, this.duplicateContacts,
      // Activities
      this.activitySummary, this.activityHeatmap, this.callLog,
      this.followUp, this.productivity, this.activityOutcome,
      // Demos
      this.demoSummary, this.demoConversion, this.demoCalendar, this.noShow,
      // Quotations
      this.quotationSummary, this.quotationAging, this.quotationVsOrder,
      this.productWiseQuotation, this.revisionHistory,
      // Tour Plans
      this.tourPlanCompliance, this.visitOutcome,
      this.fieldTeamTracker, this.visitToConversion,
      // Team
      this.individualScorecard, this.teamLeaderboard,
      this.workloadDistribution, this.responseTime, this.newJoinerRampUp,
      // Communications
      this.emailPerformance, this.whatsappPerformance,
      this.campaign, this.channelEffectiveness,
      // Executive
      this.ceoDashboard, this.monthlyBusinessReview, this.quarterlyBusinessReview,
      this.customerConcentration, this.pipelineHealth, this.dailyDigest,
      // Custom
      this.customReport,
    ];
    for (const report of reports) {
      this.engine.registerReport(report);
    }
  }
}
