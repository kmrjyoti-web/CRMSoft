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
exports.DashboardAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const STAGE_PROBABILITY = {
    NEW: 10, VERIFIED: 20, ALLOCATED: 30, IN_PROGRESS: 40,
    DEMO_SCHEDULED: 50, QUOTATION_SENT: 70, NEGOTIATION: 85,
    WON: 100, LOST: 0, ON_HOLD: 0,
};
let DashboardAggregatorService = class DashboardAggregatorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getExecutiveDashboard(params) {
        const { dateFrom, dateTo, userId } = params;
        const duration = dateTo.getTime() - dateFrom.getTime();
        const prevFrom = new Date(dateFrom.getTime() - duration);
        const prevTo = new Date(dateFrom.getTime() - 1);
        const userFilter = userId ? { allocatedToId: userId } : {};
        const activityUserFilter = userId ? { createdById: userId } : {};
        const [totalLeads, leadsWon, leadsLost, revenue, pipelineValue, totalActivities, quotationsSent, wonLeadsForAvg] = await Promise.all([
            this.prisma.working.lead.count({ where: { createdAt: { gte: dateFrom, lte: dateTo }, ...userFilter } }),
            this.prisma.working.lead.count({ where: { status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo }, ...userFilter } }),
            this.prisma.working.lead.count({ where: { status: 'LOST', updatedAt: { gte: dateFrom, lte: dateTo }, ...userFilter } }),
            this.prisma.working.lead.aggregate({ where: { status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo }, ...userFilter }, _sum: { expectedValue: true } }),
            this.prisma.working.lead.aggregate({ where: { status: { notIn: ['WON', 'LOST', 'ON_HOLD'] }, ...userFilter }, _sum: { expectedValue: true } }),
            this.prisma.working.activity.count({ where: { createdAt: { gte: dateFrom, lte: dateTo }, ...activityUserFilter } }),
            this.prisma.working.quotation.count({ where: { status: { not: 'DRAFT' }, createdAt: { gte: dateFrom, lte: dateTo } } }),
            this.prisma.working.lead.findMany({ where: { status: 'WON', updatedAt: { gte: dateFrom, lte: dateTo }, ...userFilter }, select: { createdAt: true, updatedAt: true } }),
        ]);
        const revenueVal = Number(revenue._sum.expectedValue || 0);
        const pipelineVal = Number(pipelineValue._sum.expectedValue || 0);
        const convRate = (leadsWon + leadsLost) > 0 ? (leadsWon / (leadsWon + leadsLost)) * 100 : 0;
        const avgCloseDays = wonLeadsForAvg.length > 0
            ? wonLeadsForAvg.reduce((sum, l) => sum + (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000, 0) / wonLeadsForAvg.length
            : 0;
        const [prevLeads, prevWon, prevLost, prevRevenue, prevPipeline, prevActivities, prevQuotations, prevWonLeads] = await Promise.all([
            this.prisma.working.lead.count({ where: { createdAt: { gte: prevFrom, lte: prevTo }, ...userFilter } }),
            this.prisma.working.lead.count({ where: { status: 'WON', updatedAt: { gte: prevFrom, lte: prevTo }, ...userFilter } }),
            this.prisma.working.lead.count({ where: { status: 'LOST', updatedAt: { gte: prevFrom, lte: prevTo }, ...userFilter } }),
            this.prisma.working.lead.aggregate({ where: { status: 'WON', updatedAt: { gte: prevFrom, lte: prevTo }, ...userFilter }, _sum: { expectedValue: true } }),
            this.prisma.working.lead.aggregate({ where: { status: { notIn: ['WON', 'LOST', 'ON_HOLD'] }, ...userFilter }, _sum: { expectedValue: true } }),
            this.prisma.working.activity.count({ where: { createdAt: { gte: prevFrom, lte: prevTo }, ...activityUserFilter } }),
            this.prisma.working.quotation.count({ where: { status: { not: 'DRAFT' }, createdAt: { gte: prevFrom, lte: prevTo } } }),
            this.prisma.working.lead.findMany({ where: { status: 'WON', updatedAt: { gte: prevFrom, lte: prevTo }, ...userFilter }, select: { createdAt: true, updatedAt: true } }),
        ]);
        const prevRevenueVal = Number(prevRevenue._sum.expectedValue || 0);
        const prevPipelineVal = Number(prevPipeline._sum.expectedValue || 0);
        const prevConvRate = (prevWon + prevLost) > 0 ? (prevWon / (prevWon + prevLost)) * 100 : 0;
        const prevAvgClose = prevWonLeads.length > 0
            ? prevWonLeads.reduce((s, l) => s + (l.updatedAt.getTime() - l.createdAt.getTime()) / 86400000, 0) / prevWonLeads.length
            : 0;
        const change = (curr, prev) => {
            if (prev === 0)
                return { changePercent: curr > 0 ? 100 : 0, changeDirection: curr > prev ? 'UP' : curr < prev ? 'DOWN' : 'FLAT' };
            const pct = ((curr - prev) / prev) * 100;
            return { changePercent: Math.round(pct * 10) / 10, changeDirection: pct > 0 ? 'UP' : pct < 0 ? 'DOWN' : 'FLAT' };
        };
        const kpiCards = [
            { key: 'total_leads', label: 'Total Leads', value: totalLeads, previousValue: prevLeads, ...change(totalLeads, prevLeads), color: '#3B82F6' },
            { key: 'leads_won', label: 'Leads Won', value: leadsWon, previousValue: prevWon, ...change(leadsWon, prevWon), color: '#10B981' },
            { key: 'conversion_rate', label: 'Conversion Rate', value: Math.round(convRate * 10) / 10, previousValue: Math.round(prevConvRate * 10) / 10, ...change(convRate, prevConvRate), suffix: '%', color: '#8B5CF6' },
            { key: 'revenue', label: 'Revenue (Won)', value: revenueVal, previousValue: prevRevenueVal, ...change(revenueVal, prevRevenueVal), prefix: '₹', format: 'currency', color: '#F59E0B' },
            { key: 'pipeline_value', label: 'Pipeline Value', value: pipelineVal, previousValue: prevPipelineVal, ...change(pipelineVal, prevPipelineVal), prefix: '₹', format: 'currency', color: '#06B6D4' },
            { key: 'total_activities', label: 'Total Activities', value: totalActivities, previousValue: prevActivities, ...change(totalActivities, prevActivities), color: '#EC4899' },
            { key: 'quotations_sent', label: 'Quotations Sent', value: quotationsSent, previousValue: prevQuotations, ...change(quotationsSent, prevQuotations), color: '#F97316' },
            { key: 'avg_close_days', label: 'Avg Close Time', value: Math.round(avgCloseDays * 10) / 10, previousValue: Math.round(prevAvgClose * 10) / 10, ...change(avgCloseDays, prevAvgClose), suffix: ' days', color: '#6366F1', lowerIsBetter: true },
        ];
        const [overdueFollowUps, upcomingDemos, expiringQuotations, unassignedLeads] = await Promise.all([
            this.prisma.working.followUp.count({ where: { isOverdue: true, completedAt: null, isActive: true, ...(userId ? { assignedToId: userId } : {}) } }),
            this.prisma.working.demo.count({ where: { status: 'SCHEDULED', scheduledAt: { gte: new Date() }, ...(userId ? { conductedById: userId } : {}) } }),
            this.prisma.working.quotation.count({ where: { status: 'SENT', validUntil: { lte: new Date(Date.now() + 7 * 86400000) } } }),
            this.prisma.working.lead.count({ where: { allocatedToId: null, status: 'NEW' } }),
        ]);
        return {
            period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
            previousPeriod: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
            kpiCards,
            quickStats: { overdueFollowUps, upcomingDemos, expiringQuotations, unassignedLeads },
        };
    }
    async getMyDashboard(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [activitiesPlanned, activitiesCompleted, upcomingDemos, overdueFollowUps, leadsByStatus, draftQuots, sentQuots, recentActivity] = await Promise.all([
            this.prisma.working.activity.count({ where: { createdById: userId, scheduledAt: { gte: today, lt: tomorrow } } }),
            this.prisma.working.activity.count({ where: { createdById: userId, completedAt: { gte: today, lt: tomorrow } } }),
            this.prisma.working.demo.count({ where: { conductedById: userId, status: 'SCHEDULED', scheduledAt: { gte: new Date() } } }),
            this.prisma.working.followUp.count({ where: { assignedToId: userId, isOverdue: true, completedAt: null, isActive: true } }),
            this.prisma.working.lead.groupBy({ by: ['status'], where: { allocatedToId: userId, status: { notIn: ['LOST'] } }, _count: true }),
            this.prisma.working.quotation.count({ where: { createdById: userId, status: 'DRAFT' } }),
            this.prisma.working.quotation.count({ where: { createdById: userId, status: 'SENT' } }),
            this.prisma.working.activity.findMany({ where: { createdById: userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { type: true, subject: true, completedAt: true, createdAt: true } }),
        ]);
        const myLeads = { total: 0 };
        for (const s of leadsByStatus) {
            myLeads[s.status.toLowerCase()] = s._count;
            myLeads.total += s._count;
        }
        const targets = await this.prisma.working.salesTarget.findMany({
            where: { userId, isActive: true, periodEnd: { gte: new Date() } },
            select: { metric: true, targetValue: true, currentValue: true, achievedPercent: true },
        });
        return {
            today: { date: today.toISOString().split('T')[0], activitiesPlanned, activitiesCompleted, upcomingDemos, overdueFollowUps },
            myLeads,
            myQuotations: { draft: draftQuots, sent: sentQuots },
            myTargets: targets.map(t => ({
                metric: t.metric, target: Number(t.targetValue), current: Number(t.currentValue),
                percent: Number(t.achievedPercent),
                status: Number(t.achievedPercent) >= 100 ? 'ACHIEVED' : Number(t.achievedPercent) >= 70 ? 'ON_TRACK' : Number(t.achievedPercent) >= 50 ? 'AT_RISK' : 'BEHIND',
            })),
            recentActivity,
        };
    }
};
exports.DashboardAggregatorService = DashboardAggregatorService;
exports.DashboardAggregatorService = DashboardAggregatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardAggregatorService);
//# sourceMappingURL=dashboard-aggregator.service.js.map