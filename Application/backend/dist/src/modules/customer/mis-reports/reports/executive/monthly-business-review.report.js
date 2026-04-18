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
exports.MonthlyBusinessReviewReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let MonthlyBusinessReviewReport = class MonthlyBusinessReviewReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'MONTHLY_BUSINESS_REVIEW';
        this.name = 'Monthly Business Review';
        this.category = 'EXECUTIVE';
        this.description = 'Comprehensive monthly business review covering revenue, pipeline, leads, team performance, activity, and quotations';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const { dateFrom, dateTo } = params;
        const dayCount = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000));
        const prevFrom = new Date(dateFrom.getTime() - (dateTo.getTime() - dateFrom.getTime()));
        const prevTo = new Date(dateFrom.getTime() - 1);
        const wonLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo } },
            select: { id: true, expectedValue: true, leadNumber: true,
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
            },
            orderBy: { expectedValue: 'desc' },
        });
        const totalRevenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const prevWon = await this.prisma.working.lead.count({
            where: { tenantId, status: 'WON', updatedAt: { gte: prevFrom, lte: prevTo } },
        });
        const prevRevAgg = await this.prisma.working.lead.aggregate({
            where: { tenantId, status: 'WON', updatedAt: { gte: prevFrom, lte: prevTo } },
            _sum: { expectedValue: true },
        });
        const prevRevenue = Number(prevRevAgg._sum.expectedValue || 0);
        const revenueChange = prevRevenue > 0
            ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 10000) / 100
            : 0;
        const topDeals = wonLeads.slice(0, 5).map(l => ({
            leadNumber: l.leadNumber,
            contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
            organization: l.organization?.name || '',
            value: Number(l.expectedValue || 0),
        }));
        const pipelineLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: { notIn: ['WON', 'LOST'] } },
            select: { id: true, status: true, expectedValue: true, expectedCloseDate: true },
        });
        const pipelineTotal = pipelineLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const stageMap = new Map();
        pipelineLeads.forEach(l => {
            if (!stageMap.has(l.status))
                stageMap.set(l.status, { count: 0, value: 0 });
            const e = stageMap.get(l.status);
            e.count++;
            e.value += Number(l.expectedValue || 0);
        });
        const nextMonthEnd = new Date(dateTo.getTime() + 30 * 86400000);
        const forecast = pipelineLeads
            .filter(l => l.expectedCloseDate && l.expectedCloseDate <= nextMonthEnd)
            .reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const leadStatuses = ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED',
            'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'];
        const funnelCounts = {};
        for (const st of leadStatuses) {
            funnelCounts[st] = await this.prisma.working.lead.count({
                where: { tenantId, status: st, createdAt: { gte: dateFrom, lte: dateTo } },
            });
        }
        const staleCount = await this.prisma.working.lead.count({
            where: { tenantId, status: { notIn: ['WON', 'LOST'] },
                updatedAt: { lt: new Date(dateTo.getTime() - 15 * 86400000) } },
        });
        const targets = await this.prisma.working.salesTarget.findMany({
            where: { tenantId, isActive: true },
            select: { userId: true, achievedPercent: true },
        });
        const userIds = [...new Set(targets.filter(t => t.userId).map(t => t.userId))];
        const users = userIds.length > 0
            ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } })
            : [];
        const userNameMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
        const teamScores = targets.filter(t => t.userId).map(t => ({
            name: userNameMap.get(t.userId) || 'Unknown',
            score: Number(t.achievedPercent),
        })).sort((a, b) => b.score - a.score);
        const avgTeamScore = teamScores.length > 0
            ? Math.round(teamScores.reduce((s, t) => s + t.score, 0) / teamScores.length * 100) / 100
            : 0;
        const totalActivities = await this.prisma.working.activity.count({
            where: { tenantId, createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const avgActivitiesPerDay = Math.round((totalActivities / dayCount) * 100) / 100;
        const overdueFollowUps = await this.prisma.working.activity.count({
            where: { tenantId, scheduledAt: { lt: new Date(), gte: dateFrom }, completedAt: null },
        });
        const followUpCompliance = totalActivities > 0
            ? Math.round(((totalActivities - overdueFollowUps) / totalActivities) * 10000) / 100
            : 100;
        const quotationsSent = await this.prisma.working.quotation.count({
            where: { tenantId, createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const quotationsAccepted = await this.prisma.working.quotation.count({
            where: { tenantId, status: 'ACCEPTED', createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const acceptanceRate = quotationsSent > 0
            ? Math.round((quotationsAccepted / quotationsSent) * 10000) / 100
            : 0;
        const pendingQuotations = await this.prisma.working.quotation.aggregate({
            where: { tenantId, status: { notIn: ['ACCEPTED', 'REJECTED', 'CANCELLED'] },
                createdAt: { gte: dateFrom, lte: dateTo } },
            _sum: { totalAmount: true },
        });
        const pendingValue = Number(pendingQuotations._sum.totalAmount || 0);
        const leadsWon = wonLeads.length;
        const conversionRate = (funnelCounts['WON'] + funnelCounts['LOST']) > 0
            ? Math.round((funnelCounts['WON'] / (funnelCounts['WON'] + funnelCounts['LOST'])) * 10000) / 100
            : 0;
        const summary = [
            { key: 'revenue', label: 'Revenue', value: totalRevenue, format: 'currency' },
            { key: 'leadsWon', label: 'Leads Won', value: leadsWon, format: 'number' },
            { key: 'conversionRate', label: 'Conversion Rate', value: conversionRate, format: 'percent' },
            { key: 'pipelineValue', label: 'Pipeline Value', value: pipelineTotal, format: 'currency' },
            { key: 'teamAvgScore', label: 'Team Avg Score', value: avgTeamScore, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Revenue: Current vs Last Month',
                labels: ['Last Month', 'This Month'],
                datasets: [{ label: 'Revenue', data: [prevRevenue, totalRevenue], color: '#4CAF50' }],
            },
            {
                type: 'PIE', title: 'Lead Status Distribution',
                labels: Object.keys(funnelCounts).filter(k => funnelCounts[k] > 0),
                datasets: [{ label: 'Leads', data: Object.keys(funnelCounts).filter(k => funnelCounts[k] > 0).map(k => funnelCounts[k]) }],
            },
            {
                type: 'BAR', title: 'Team Scores (Top 5)',
                labels: teamScores.slice(0, 5).map(t => t.name),
                datasets: [{ label: 'Score %', data: teamScores.slice(0, 5).map(t => t.score), color: '#2196F3' }],
            },
        ];
        const executiveSummaryCols = [
            { key: 'metric', header: 'Metric', width: 25 },
            { key: 'value', header: 'Value', width: 20 },
        ];
        const executiveSummaryRows = [
            { metric: 'Total Revenue', value: totalRevenue },
            { metric: 'Revenue Change vs Last Month', value: `${revenueChange}%` },
            { metric: 'Leads Won', value: leadsWon },
            { metric: 'Pipeline Value', value: pipelineTotal },
            { metric: 'Stale Leads', value: staleCount },
        ];
        const topDealsCols = [
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'contact', header: 'Contact', width: 20 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'value', header: 'Value', width: 16, format: 'currency' },
        ];
        const sections = {
            executiveSummary: { highlights: [`Revenue: ${totalRevenue}`, `Won ${leadsWon} deals`],
                concerns: staleCount > 5 ? [`${staleCount} stale leads need attention`] : [] },
            revenue: { total: totalRevenue, vsLastMonth: revenueChange, topDeals },
            pipeline: { total: pipelineTotal, byStage: Object.fromEntries(stageMap), forecast },
            leads: { funnel: funnelCounts, staleCount },
            team: { topPerformer: teamScores[0]?.name || 'N/A',
                needsAttention: teamScores[teamScores.length - 1]?.name || 'N/A', avgScore: avgTeamScore },
            activity: { total: totalActivities, avgPerDay: avgActivitiesPerDay, followUpCompliance },
            quotation: { sent: quotationsSent, accepted: quotationsAccepted, acceptanceRate, pendingValue },
            actionItems: [
                ...(staleCount > 0 ? [`Follow up on ${staleCount} stale leads`] : []),
                ...(overdueFollowUps > 0 ? [`${overdueFollowUps} overdue follow-ups need attention`] : []),
                ...(acceptanceRate < 30 ? ['Review quotation strategy - low acceptance rate'] : []),
            ],
        };
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [
                { title: 'Executive Summary', columns: executiveSummaryCols, rows: executiveSummaryRows },
                { title: 'Top Deals', columns: topDealsCols, rows: topDeals },
            ],
            metadata: { sections },
        };
    }
};
exports.MonthlyBusinessReviewReport = MonthlyBusinessReviewReport;
exports.MonthlyBusinessReviewReport = MonthlyBusinessReviewReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], MonthlyBusinessReviewReport);
//# sourceMappingURL=monthly-business-review.report.js.map