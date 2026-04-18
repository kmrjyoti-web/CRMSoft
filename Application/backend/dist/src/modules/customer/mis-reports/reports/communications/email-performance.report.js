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
exports.EmailPerformanceReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let EmailPerformanceReport = class EmailPerformanceReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'EMAIL_PERFORMANCE';
        this.name = 'Email Performance';
        this.category = 'COMMUNICATION';
        this.description = 'Tracks email activity volume, per-user email metrics, and lead touch rates via email channel';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'userId', label: 'User', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            type: 'EMAIL',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        const emailActivities = await this.prisma.working.activity.findMany({
            where,
            select: {
                id: true, createdAt: true, leadId: true,
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const sendLogs = await this.prisma.working.quotationSendLog.findMany({
            where: {
                tenantId: params.tenantId,
                channel: 'EMAIL',
                sentAt: { gte: params.dateFrom, lte: params.dateTo },
            },
            select: { id: true, sentAt: true },
        });
        const totalEmailActivities = emailActivities.length + sendLogs.length;
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const avgPerDay = Math.round((totalEmailActivities / dayCount) * 100) / 100;
        const userMap = new Map();
        emailActivities.forEach(a => {
            const uid = a.createdByUser.id;
            const uName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
            if (!userMap.has(uid))
                userMap.set(uid, { name: uName, emailsSent: 0, leadIds: new Set() });
            const entry = userMap.get(uid);
            entry.emailsSent++;
            if (a.leadId)
                entry.leadIds.add(a.leadId);
        });
        const userStats = [...userMap.entries()].map(([userId, d]) => ({
            userId, name: d.name, emailsSent: d.emailsSent, uniqueLeads: d.leadIds.size,
        })).sort((a, b) => b.emailsSent - a.emailsSent);
        const topEmailer = userStats[0]?.name || 'N/A';
        const allLeadIds = new Set();
        emailActivities.forEach(a => { if (a.leadId)
            allLeadIds.add(a.leadId); });
        const totalLeads = await this.prisma.working.lead.count({
            where: { tenantId: params.tenantId, createdAt: { lte: params.dateTo } },
        });
        const emailLeadTouchRate = totalLeads > 0
            ? Math.round((allLeadIds.size / totalLeads) * 10000) / 100
            : 0;
        const dailyMap = new Map();
        emailActivities.forEach(a => {
            const day = a.createdAt.toISOString().slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        });
        const sortedDays = [...dailyMap.keys()].sort();
        const summary = [
            { key: 'totalEmailActivities', label: 'Total Email Activities', value: totalEmailActivities, format: 'number' },
            { key: 'avgPerDay', label: 'Avg Emails per Day', value: avgPerDay, format: 'number' },
            { key: 'topEmailerCount', label: 'Top Emailer Count', value: userStats[0]?.emailsSent || 0, format: 'number' },
            { key: 'emailLeadTouchRate', label: 'Email Lead Touch Rate', value: emailLeadTouchRate, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Emails by User',
                labels: userStats.map(u => u.name),
                datasets: [{ label: 'Emails Sent', data: userStats.map(u => u.emailsSent), color: '#2196F3' }],
            },
            {
                type: 'LINE', title: 'Daily Email Trend',
                labels: sortedDays,
                datasets: [{ label: 'Emails', data: sortedDays.map(d => dailyMap.get(d)), color: '#FF9800' }],
            },
        ];
        const tableCols = [
            { key: 'name', header: 'User', width: 22 },
            { key: 'emailsSent', header: 'Emails Sent', width: 14, format: 'number' },
            { key: 'uniqueLeads', header: 'Unique Leads', width: 14, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Per User Email Metrics', columns: tableCols, rows: userStats }],
            metadata: { topEmailer },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            type: 'EMAIL',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user')
            where.createdById = params.value;
        const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.EmailPerformanceReport = EmailPerformanceReport;
exports.EmailPerformanceReport = EmailPerformanceReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], EmailPerformanceReport);
//# sourceMappingURL=email-performance.report.js.map