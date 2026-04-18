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
exports.QuarterlyBusinessReviewReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let QuarterlyBusinessReviewReport = class QuarterlyBusinessReviewReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'QUARTERLY_BUSINESS_REVIEW';
        this.name = 'Quarterly Business Review';
        this.category = 'EXECUTIVE';
        this.description = 'Comprehensive quarterly review with YoY comparison, target achievements, revenue, pipeline, and team analysis';
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
        const qMonth = dateFrom.getMonth();
        const qNum = Math.floor(qMonth / 3) + 1;
        const quarterLabel = `Q${qNum} ${dateFrom.getFullYear()}`;
        const yoyFrom = new Date(dateFrom);
        yoyFrom.setFullYear(yoyFrom.getFullYear() - 1);
        const yoyTo = new Date(dateTo);
        yoyTo.setFullYear(yoyTo.getFullYear() - 1);
        const wonLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo } },
            select: { id: true, expectedValue: true, leadNumber: true,
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
            },
            orderBy: { expectedValue: 'desc' },
        });
        const totalRevenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const leadsWon = wonLeads.length;
        const yoyRevAgg = await this.prisma.working.lead.aggregate({
            where: { tenantId, status: 'WON', updatedAt: { gte: yoyFrom, lte: yoyTo } },
            _sum: { expectedValue: true }, _count: true,
        });
        const yoyRevenue = Number(yoyRevAgg._sum.expectedValue || 0);
        const yoyLeadsWon = yoyRevAgg._count;
        const yoyRevenueChange = yoyRevenue > 0
            ? Math.round(((totalRevenue - yoyRevenue) / yoyRevenue) * 10000) / 100
            : 0;
        const pipelineLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: { notIn: ['WON', 'LOST'] } },
            select: { id: true, status: true, expectedValue: true },
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
            select: { userId: true, achievedPercent: true, targetValue: true, currentValue: true },
        });
        const userIds = [...new Set(targets.filter(t => t.userId).map(t => t.userId))];
        const users = userIds.length > 0
            ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } })
            : [];
        const userNameMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
        const teamScores = targets.filter(t => t.userId).map(t => ({
            name: userNameMap.get(t.userId) || 'Unknown',
            score: Number(t.achievedPercent),
            target: Number(t.targetValue),
            current: Number(t.currentValue),
        })).sort((a, b) => b.score - a.score);
        const avgTeamScore = teamScores.length > 0
            ? Math.round(teamScores.reduce((s, t) => s + t.score, 0) / teamScores.length * 100) / 100
            : 0;
        const totalActivities = await this.prisma.working.activity.count({
            where: { tenantId, createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const avgActivitiesPerDay = Math.round((totalActivities / dayCount) * 100) / 100;
        const quotationsSent = await this.prisma.working.quotation.count({
            where: { tenantId, createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const quotationsAccepted = await this.prisma.working.quotation.count({
            where: { tenantId, status: 'ACCEPTED', createdAt: { gte: dateFrom, lte: dateTo } },
        });
        const acceptanceRate = quotationsSent > 0
            ? Math.round((quotationsAccepted / quotationsSent) * 10000) / 100
            : 0;
        const totalDecided = (funnelCounts['WON'] || 0) + (funnelCounts['LOST'] || 0);
        const conversionRate = totalDecided > 0
            ? Math.round(((funnelCounts['WON'] || 0) / totalDecided) * 10000) / 100
            : 0;
        const totalTarget = targets.reduce((s, t) => s + Number(t.targetValue), 0);
        const totalAchieved = targets.reduce((s, t) => s + Number(t.currentValue), 0);
        const overallAchievement = totalTarget > 0
            ? Math.round((totalAchieved / totalTarget) * 10000) / 100
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
                type: 'BAR', title: `Revenue: ${quarterLabel} vs Same Quarter Last Year`,
                labels: [`${quarterLabel} Last Year`, quarterLabel],
                datasets: [{ label: 'Revenue', data: [yoyRevenue, totalRevenue], color: '#4CAF50' }],
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
            { key: 'metric', header: 'Metric', width: 30 },
            { key: 'value', header: 'Value', width: 20 },
        ];
        const executiveSummaryRows = [
            { metric: 'Total Revenue', value: totalRevenue },
            { metric: 'YoY Revenue Change', value: `${yoyRevenueChange}%` },
            { metric: 'Leads Won', value: leadsWon },
            { metric: 'YoY Leads Won Change', value: yoyLeadsWon > 0 ? `${Math.round(((leadsWon - yoyLeadsWon) / yoyLeadsWon) * 100)}%` : 'N/A' },
            { metric: 'Pipeline Value', value: pipelineTotal },
            { metric: 'Target Achievement', value: `${overallAchievement}%` },
        ];
        const targetCols = [
            { key: 'name', header: 'Team Member', width: 22 },
            { key: 'target', header: 'Target', width: 16, format: 'currency' },
            { key: 'current', header: 'Achieved', width: 16, format: 'currency' },
            { key: 'score', header: 'Achievement %', width: 16, format: 'percent' },
        ];
        const sections = {
            executiveSummary: {
                highlights: [`Revenue: ${totalRevenue}`, `Won ${leadsWon} deals`, `YoY change: ${yoyRevenueChange}%`],
                concerns: staleCount > 5 ? [`${staleCount} stale leads`] : [],
            },
            revenue: { total: totalRevenue, yoyChange: yoyRevenueChange },
            pipeline: { total: pipelineTotal, byStage: Object.fromEntries(stageMap) },
            leads: { funnel: funnelCounts, staleCount },
            team: { topPerformer: teamScores[0]?.name || 'N/A', avgScore: avgTeamScore },
            activity: { total: totalActivities, avgPerDay: avgActivitiesPerDay },
            quotation: { sent: quotationsSent, accepted: quotationsAccepted, acceptanceRate },
            targetAchievement: { totalTarget, totalAchieved, overallAchievement },
            actionItems: [
                ...(staleCount > 0 ? [`Address ${staleCount} stale leads`] : []),
                ...(overallAchievement < 70 ? ['Team targets need attention'] : []),
            ],
        };
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [
                { title: 'Executive Summary', columns: executiveSummaryCols, rows: executiveSummaryRows },
                { title: 'Target vs Achievement', columns: targetCols, rows: teamScores },
            ],
            metadata: { quarter: quarterLabel, sections },
        };
    }
};
exports.QuarterlyBusinessReviewReport = QuarterlyBusinessReviewReport;
exports.QuarterlyBusinessReviewReport = QuarterlyBusinessReviewReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], QuarterlyBusinessReviewReport);
//# sourceMappingURL=quarterly-business-review.report.js.map