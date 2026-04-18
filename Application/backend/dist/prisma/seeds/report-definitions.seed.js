"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedReportDefinitions = seedReportDefinitions;
const REPORT_DEFINITIONS = [
    { code: 'SALES_SUMMARY', name: 'Sales Summary', category: 'SALES', description: 'Overall sales KPIs including leads, revenue, conversion rate, and pipeline value', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 1 },
    { code: 'REVENUE', name: 'Revenue Analysis', category: 'SALES', description: 'Revenue breakdown by month, source, and industry with deal size distribution', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 2 },
    { code: 'TARGET_VS_ACHIEVEMENT', name: 'Target vs Achievement', category: 'SALES', description: 'Compare sales targets against actual achievements with projected outcomes', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 3 },
    { code: 'SALES_FORECAST', name: 'Sales Forecast', category: 'SALES', description: 'Pipeline-weighted revenue forecast with optimistic, realistic, and pessimistic scenarios', supportsDrillDown: true, sortOrder: 4 },
    { code: 'DEAL_VELOCITY', name: 'Deal Velocity', category: 'SALES', description: 'Sales velocity metrics including cycle length, win rate, and per-stage timing', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 5 },
    { code: 'WIN_LOSS_ANALYSIS', name: 'Win/Loss Analysis', category: 'SALES', description: 'Detailed analysis of won vs lost deals by source, user, and lost reason', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 6 },
    { code: 'SALES_TREND', name: 'Sales Trend', category: 'SALES', description: 'Rolling monthly revenue trend with cumulative view and month-over-month growth', supportsPeriodComparison: true, sortOrder: 7 },
    { code: 'LEAD_FUNNEL', name: 'Lead Funnel Analysis', category: 'LEAD', description: 'Visualises the lead pipeline as a funnel with stage counts and drop-off percentages', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 10 },
    { code: 'LEAD_SOURCE_ANALYSIS', name: 'Lead Source Analysis', category: 'LEAD', description: 'Analyses lead generation effectiveness across different sources with conversion and revenue metrics', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 11 },
    { code: 'LEAD_AGING', name: 'Lead Aging Report', category: 'LEAD', description: 'Analyses active leads by age buckets to identify stale or ageing pipeline items', supportsDrillDown: true, sortOrder: 12 },
    { code: 'LEAD_STATUS_BREAKDOWN', name: 'Lead Status Breakdown', category: 'LEAD', description: 'Snapshot of leads grouped by current status with count and value distribution', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 13 },
    { code: 'LEAD_ALLOCATION', name: 'Lead Allocation Report', category: 'LEAD', description: 'Analyses lead distribution across team members with performance and workload metrics', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 14 },
    { code: 'HOT_LEADS', name: 'Hot Leads Report', category: 'LEAD', description: 'Identifies high-priority leads with imminent close dates and significant value, scored for urgency', supportsDrillDown: true, sortOrder: 15 },
    { code: 'LEAD_QUALITY_SCORE', name: 'Lead Quality Score', category: 'LEAD', description: 'Scores each lead on a 0-100 scale based on completeness, engagement, and progression indicators', supportsDrillDown: true, sortOrder: 16 },
    { code: 'DEAD_LOST_LEADS', name: 'Dead & Lost Leads', category: 'LEAD', description: 'Analyses lost and stale on-hold leads with reason breakdown and recovery potential', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 17 },
    { code: 'CONTACT_GROWTH', name: 'Contact Growth', category: 'CONTACT_ORG', description: 'Tracks new contacts added over time with cumulative growth curve and monthly breakdown', supportsPeriodComparison: true, sortOrder: 20 },
    { code: 'CONTACT_COMPLETENESS', name: 'Contact Completeness', category: 'CONTACT_ORG', description: 'Scores each contact on data completeness and groups them into quality tiers', sortOrder: 21 },
    { code: 'ORG_WISE_REVENUE', name: 'Org-wise Revenue', category: 'CONTACT_ORG', description: 'Per organization leads, won deals, revenue, and lifetime value with Pareto analysis', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 22 },
    { code: 'INDUSTRY_WISE_ANALYSIS', name: 'Industry-Wise Analysis', category: 'CONTACT_ORG', description: 'Analyzes lead performance, conversion rates, and revenue grouped by organization industry', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 23 },
    { code: 'GEOGRAPHIC_DISTRIBUTION', name: 'Geographic Distribution', category: 'CONTACT_ORG', description: 'Analyzes organization and lead distribution by state and city with revenue breakdown', supportsDrillDown: true, sortOrder: 24 },
    { code: 'DUPLICATE_CONTACTS', name: 'Duplicate Contacts', category: 'CONTACT_ORG', description: 'Identifies potential duplicate contacts by name matching and groups them by severity', sortOrder: 25 },
    { code: 'ACTIVITY_SUMMARY', name: 'Activity Summary', category: 'ACTIVITY', description: 'Overview of all activities by type and user with daily breakdown and volume trends', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 30 },
    { code: 'ACTIVITY_HEATMAP', name: 'Activity Heatmap', category: 'ACTIVITY', description: 'Visualizes activity patterns in a day-of-week by hour-of-day heatmap to identify peak engagement times', sortOrder: 31 },
    { code: 'CALL_LOG', name: 'Call Log', category: 'ACTIVITY', description: 'Detailed call activity analysis including duration, outcomes, and daily call volume trends', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 32 },
    { code: 'FOLLOW_UP_COMPLIANCE', name: 'Follow-Up Compliance', category: 'ACTIVITY', description: 'Measures follow-up completion rates and identifies overdue activities per user', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 33 },
    { code: 'PRODUCTIVITY', name: 'Productivity Report', category: 'ACTIVITY', description: 'Composite productivity scoring per user based on activities, leads, demos, and quotations', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 34 },
    { code: 'ACTIVITY_VS_OUTCOME', name: 'Activity vs Outcome', category: 'ACTIVITY', description: 'Correlates activity volume per lead with lead outcomes to identify optimal engagement levels', sortOrder: 35 },
    { code: 'DEMO_SUMMARY', name: 'Demo Summary', category: 'DEMO', description: 'Comprehensive overview of demo activities by status, mode, and user with monthly trends', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 40 },
    { code: 'DEMO_CONVERSION', name: 'Demo Conversion', category: 'DEMO', description: 'Tracks the Demo to Quotation to Won pipeline with conversion rates at each stage', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 41 },
    { code: 'DEMO_CALENDAR', name: 'Demo Calendar', category: 'DEMO', description: 'Daily demo schedule view with per-user load distribution and capacity insights', sortOrder: 42 },
    { code: 'NO_SHOW_ANALYSIS', name: 'No-Show Analysis', category: 'DEMO', description: 'Analyzes demo no-show patterns by day, time, and mode with actionable suggestions', sortOrder: 43 },
    { code: 'QUOTATION_SUMMARY', name: 'Quotation Summary', category: 'QUOTATION', description: 'Overall quotation KPIs including volume, value, acceptance rates, and response times', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 50 },
    { code: 'QUOTATION_AGING', name: 'Quotation Aging Report', category: 'QUOTATION', description: 'Tracks pending quotations by age buckets with recommended actions and expiry alerts', supportsDrillDown: true, sortOrder: 51 },
    { code: 'QUOTATION_VS_ORDER', name: 'Quotation vs Order', category: 'QUOTATION', description: 'Compares quoted amounts against won deal values, highlighting discount patterns and revision impact', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 52 },
    { code: 'PRODUCT_WISE_QUOTATION', name: 'Product-wise Quotation Analysis', category: 'QUOTATION', description: 'Breaks down quotation performance by product including quote frequency, value, and acceptance rates', supportsDrillDown: true, sortOrder: 53 },
    { code: 'REVISION_HISTORY', name: 'Revision History Analysis', category: 'QUOTATION', description: 'Analyses quotation revision patterns, discount progression, and outcome correlation with revision counts', sortOrder: 54 },
    { code: 'TOUR_PLAN_COMPLIANCE', name: 'Tour Plan Compliance', category: 'TOUR_PLAN', description: 'Tracks tour plan approval-to-completion rates and visit-level compliance per sales person', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 60 },
    { code: 'VISIT_OUTCOME', name: 'Visit Outcome Analysis', category: 'TOUR_PLAN', description: 'Analyzes tour plan visit outcomes, productive visit rates, and average time spent per visit', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 61 },
    { code: 'FIELD_TEAM_TRACKER', name: 'Field Team Tracker', category: 'TOUR_PLAN', description: 'Tracks field team activity including visits per user, organizations covered, and geographic reach', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 62 },
    { code: 'VISIT_TO_CONVERSION', name: 'Visit to Conversion', category: 'TOUR_PLAN', description: 'Measures field visit effectiveness by tracking conversion from visit to demo, quotation, and won stages', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 63 },
    { code: 'INDIVIDUAL_SCORECARD', name: 'Individual Scorecard', category: 'TEAM', description: 'Comprehensive per-employee scorecard covering leads, activities, demos, quotations, revenue, and efficiency', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 70 },
    { code: 'TEAM_LEADERBOARD', name: 'Team Leaderboard', category: 'TEAM', description: 'Ranked leaderboard of team members by selected performance metric with trend analysis', supportsPeriodComparison: true, sortOrder: 71 },
    { code: 'WORKLOAD_DISTRIBUTION', name: 'Workload Distribution', category: 'TEAM', description: 'Visualizes active workload per team member with overload detection and rebalance suggestions', sortOrder: 72 },
    { code: 'RESPONSE_TIME', name: 'Response Time Analysis', category: 'TEAM', description: 'Measures time from lead allocation to first activity per team member with SLA compliance tracking', supportsDrillDown: true, supportsPeriodComparison: true, sortOrder: 73 },
    { code: 'NEW_JOINER_RAMP_UP', name: 'New Joiner Ramp-Up', category: 'TEAM', description: 'Tracks new joiners week-by-week ramp-up in activities, deals, and revenue compared to team averages', sortOrder: 74 },
    { code: 'EMAIL_PERFORMANCE', name: 'Email Performance', category: 'COMMUNICATION', description: 'Tracks email activity volume, per-user email metrics, and lead touch rates via email channel', supportsPeriodComparison: true, sortOrder: 80 },
    { code: 'WHATSAPP_PERFORMANCE', name: 'WhatsApp Performance', category: 'COMMUNICATION', description: 'Measures WhatsApp activity volume, quotation sends via WhatsApp, and per-user engagement metrics', supportsPeriodComparison: true, sortOrder: 81 },
    { code: 'CAMPAIGN_REPORT', name: 'Campaign Report', category: 'COMMUNICATION', description: 'Analyzes batch quotation sends grouped by date and user as campaigns, with channel breakdown and view rates', supportsDrillDown: true, sortOrder: 82 },
    { code: 'CHANNEL_EFFECTIVENESS', name: 'Channel Effectiveness', category: 'COMMUNICATION', description: 'Compares communication channels by activity volume, lead conversion rates, and revenue attribution', supportsPeriodComparison: true, sortOrder: 83 },
    { code: 'CEO_DASHBOARD', name: 'CEO Dashboard', category: 'EXECUTIVE', description: 'High-level executive dashboard with 10 KPI cards, 7-day trends, top deals, and quick alerts', supportsPeriodComparison: true, sortOrder: 90 },
    { code: 'MONTHLY_BUSINESS_REVIEW', name: 'Monthly Business Review', category: 'EXECUTIVE', description: 'Comprehensive monthly business review covering revenue, pipeline, leads, team performance, activity, and quotations', supportsPeriodComparison: true, sortOrder: 91 },
    { code: 'QUARTERLY_BUSINESS_REVIEW', name: 'Quarterly Business Review', category: 'EXECUTIVE', description: 'Comprehensive quarterly review with YoY comparison, target achievements, revenue, pipeline, and team analysis', supportsPeriodComparison: true, sortOrder: 92 },
    { code: 'CUSTOMER_CONCENTRATION', name: 'Customer Concentration', category: 'EXECUTIVE', description: 'Pareto analysis of revenue by organization showing concentration risk and cumulative revenue distribution', sortOrder: 93 },
    { code: 'PIPELINE_HEALTH', name: 'Pipeline Health', category: 'EXECUTIVE', description: 'Assesses pipeline health by identifying stuck, at-risk, and inactive deals with an overall health score', sortOrder: 94 },
    { code: 'MIS_DAILY_DIGEST', name: 'Daily Digest', category: 'EXECUTIVE', description: 'Daily summary with yesterday results, today schedule, week-to-date and month-to-date progress, and alerts', sortOrder: 95 },
    { code: 'CUSTOM_REPORT', name: 'Custom Report', category: 'CUSTOM', description: 'Dynamic report builder allowing flexible entity selection, column picking, filtering, grouping, and aggregation', sortOrder: 100 },
];
async function seedReportDefinitions(prisma, tenantId) {
    let count = 0;
    const defaultFormats = ['XLSX', 'CSV', 'PDF'];
    for (const def of REPORT_DEFINITIONS) {
        await prisma.reportDefinition.upsert({
            where: {
                tenantId_code: { tenantId, code: def.code },
            },
            update: {
                name: def.name,
                description: def.description,
                category: def.category,
                sortOrder: def.sortOrder,
                supportsDrillDown: def.supportsDrillDown ?? false,
                supportsPeriodComparison: def.supportsPeriodComparison ?? false,
                availableFormats: def.availableFormats ?? defaultFormats,
            },
            create: {
                tenantId,
                code: def.code,
                name: def.name,
                description: def.description,
                category: def.category,
                sortOrder: def.sortOrder,
                supportsDrillDown: def.supportsDrillDown ?? false,
                supportsPeriodComparison: def.supportsPeriodComparison ?? false,
                availableFormats: def.availableFormats ?? defaultFormats,
                isActive: true,
            },
        });
        count++;
    }
    console.log(`✅ ${count} report definitions seeded`);
}
//# sourceMappingURL=report-definitions.seed.js.map