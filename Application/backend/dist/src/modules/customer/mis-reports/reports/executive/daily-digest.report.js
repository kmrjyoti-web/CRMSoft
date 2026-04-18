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
exports.DailyDigestReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let DailyDigestReport = class DailyDigestReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'MIS_DAILY_DIGEST';
        this.name = 'Daily Digest';
        this.category = 'EXECUTIVE';
        this.description = 'Daily summary with yesterday results, today schedule, week-to-date and month-to-date progress, and alerts';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'userId', label: 'User', type: 'user' },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);
        const yesterdayStart = new Date(todayStart.getTime() - 86400000);
        const yesterdayEnd = new Date(todayStart.getTime() - 1);
        const dayOfWeek = now.getDay();
        const wtdStart = new Date(todayStart);
        wtdStart.setDate(wtdStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const userFilter = params.userId ? { allocatedToId: params.userId } : {};
        const actUserFilter = params.userId ? { createdById: params.userId } : {};
        const yesterdayNewLeads = await this.prisma.working.lead.count({
            where: { tenantId, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, ...userFilter },
        });
        const yesterdayWon = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: yesterdayStart, lte: yesterdayEnd }, ...userFilter },
            select: { expectedValue: true },
        });
        const yesterdayLeadsWon = yesterdayWon.length;
        const yesterdayRevenue = yesterdayWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const yesterdayLeadsLost = await this.prisma.working.lead.count({
            where: { tenantId, status: 'LOST', updatedAt: { gte: yesterdayStart, lte: yesterdayEnd }, ...userFilter },
        });
        const yesterdayActivities = await this.prisma.working.activity.count({
            where: { tenantId, createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, ...actUserFilter },
        });
        const yesterdayDemos = await this.prisma.working.demo.count({
            where: { tenantId, completedAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        });
        const yesterdayQuotationsSent = await this.prisma.working.quotation.count({
            where: { tenantId, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        });
        const followUpsOverdue = await this.prisma.working.activity.count({
            where: { tenantId, scheduledAt: { lt: todayStart }, completedAt: null, ...actUserFilter },
        });
        const scheduledDemos = await this.prisma.working.demo.count({
            where: { tenantId, scheduledAt: { gte: todayStart, lte: todayEnd } },
        });
        const scheduledFollowUps = await this.prisma.working.activity.findMany({
            where: { tenantId, scheduledAt: { gte: todayStart, lte: todayEnd }, ...actUserFilter },
            select: {
                id: true, subject: true, type: true, scheduledAt: true,
                lead: { select: { leadNumber: true } },
                createdByUser: { select: { firstName: true, lastName: true } },
            },
        });
        const expiringQuotations = await this.prisma.working.quotation.count({
            where: { tenantId, status: { notIn: ['ACCEPTED', 'REJECTED', 'CANCELLED'] },
                validUntil: { gte: todayStart, lte: todayEnd } },
        });
        const hotLeads = await this.prisma.working.lead.count({
            where: { tenantId, priority: 'HIGH', status: { notIn: ['WON', 'LOST'] }, ...userFilter },
        });
        const wtdWon = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: wtdStart, lte: todayEnd }, ...userFilter },
            select: { expectedValue: true },
        });
        const wtdRevenue = wtdWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const wtdLeadsWon = wtdWon.length;
        const wtdLeadsCreated = await this.prisma.working.lead.count({
            where: { tenantId, createdAt: { gte: wtdStart, lte: todayEnd }, ...userFilter },
        });
        const mtdWon = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: mtdStart, lte: todayEnd }, ...userFilter },
            select: { expectedValue: true },
        });
        const mtdRevenue = mtdWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const activeTargets = await this.prisma.working.salesTarget.findMany({
            where: { tenantId, isActive: true, metric: 'REVENUE' },
            select: { targetValue: true },
        });
        const monthTarget = activeTargets.reduce((s, t) => s + Number(t.targetValue), 0);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();
        const weekTarget = monthTarget > 0 ? Math.round((monthTarget / daysInMonth) * 7) : 0;
        const wtdPercent = weekTarget > 0 ? Math.round((wtdRevenue / weekTarget) * 10000) / 100 : 0;
        const mtdPercent = monthTarget > 0 ? Math.round((mtdRevenue / monthTarget) * 10000) / 100 : 0;
        const overdueByUser = await this.prisma.working.activity.groupBy({
            by: ['createdById'],
            where: { tenantId, scheduledAt: { lt: todayStart }, completedAt: null },
            _count: true,
        });
        const summary = [
            { key: 'yesterdayRevenue', label: 'Yesterday Revenue', value: yesterdayRevenue, format: 'currency' },
            { key: 'todayScheduledDemos', label: 'Today Scheduled Demos', value: scheduledDemos, format: 'number' },
            { key: 'weekRevenueProgress', label: 'Week Revenue Progress', value: wtdPercent, format: 'percent' },
            { key: 'monthRevenueProgress', label: 'Month Revenue Progress', value: mtdPercent, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Yesterday vs Today Scheduled',
                labels: ['New Leads', 'Won', 'Lost', 'Activities', 'Demos', 'Follow-ups'],
                datasets: [
                    { label: 'Yesterday', data: [yesterdayNewLeads, yesterdayLeadsWon, yesterdayLeadsLost, yesterdayActivities, yesterdayDemos, followUpsOverdue], color: '#90CAF9' },
                    { label: 'Today Scheduled', data: [0, 0, 0, scheduledFollowUps.length, scheduledDemos, 0], color: '#4CAF50' },
                ],
            },
        ];
        const scheduleRows = scheduledFollowUps.map(a => ({
            time: a.scheduledAt,
            type: a.type,
            subject: a.subject,
            leadNumber: a.lead?.leadNumber || '',
            assignedTo: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
        }));
        const scheduleCols = [
            { key: 'time', header: 'Time', width: 14, format: 'date' },
            { key: 'type', header: 'Type', width: 12 },
            { key: 'subject', header: 'Subject', width: 25 },
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'assignedTo', header: 'Assigned To', width: 20 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: "Today's Schedule", columns: scheduleCols, rows: scheduleRows }],
            metadata: {
                yesterday: { newLeads: yesterdayNewLeads, leadsWon: yesterdayLeadsWon, leadsLost: yesterdayLeadsLost,
                    revenue: yesterdayRevenue, activities: yesterdayActivities, demos: yesterdayDemos,
                    quotationsSent: yesterdayQuotationsSent, followUpsOverdue },
                today: { scheduledDemos, scheduledFollowUps: scheduledFollowUps.length, expiringQuotations, hotLeads },
                weekToDate: { revenue: wtdRevenue, target: weekTarget, percentAchieved: wtdPercent,
                    leadsWon: wtdLeadsWon, leadsCreated: wtdLeadsCreated },
                monthToDate: { revenue: mtdRevenue, target: monthTarget, percentAchieved: mtdPercent },
                alerts: {
                    overdueFollowUpsByUser: overdueByUser.map(e => ({ userId: e.createdById, count: e._count })),
                    expiringQuotations,
                },
            },
        };
    }
};
exports.DailyDigestReport = DailyDigestReport;
exports.DailyDigestReport = DailyDigestReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], DailyDigestReport);
//# sourceMappingURL=daily-digest.report.js.map