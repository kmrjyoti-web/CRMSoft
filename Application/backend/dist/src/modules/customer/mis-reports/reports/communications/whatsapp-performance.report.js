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
exports.WhatsAppPerformanceReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let WhatsAppPerformanceReport = class WhatsAppPerformanceReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'WHATSAPP_PERFORMANCE';
        this.name = 'WhatsApp Performance';
        this.category = 'COMMUNICATION';
        this.description = 'Measures WhatsApp activity volume, quotation sends via WhatsApp, and per-user engagement metrics';
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
            type: 'WHATSAPP',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        const waActivities = await this.prisma.working.activity.findMany({
            where,
            select: {
                id: true, createdAt: true, leadId: true,
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const waSendLogs = await this.prisma.working.quotationSendLog.findMany({
            where: {
                tenantId: params.tenantId,
                channel: 'WHATSAPP',
                sentAt: { gte: params.dateFrom, lte: params.dateTo },
            },
            select: {
                id: true, sentAt: true,
                quotation: { select: { createdById: true } },
            },
        });
        const totalWhatsAppActivities = waActivities.length;
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const avgPerDay = Math.round((totalWhatsAppActivities / dayCount) * 100) / 100;
        const userMap = new Map();
        waActivities.forEach(a => {
            const uid = a.createdByUser.id;
            const uName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
            if (!userMap.has(uid)) {
                userMap.set(uid, { name: uName, activities: 0, leadIds: new Set(), quotationsSentViaWA: 0 });
            }
            const entry = userMap.get(uid);
            entry.activities++;
            if (a.leadId)
                entry.leadIds.add(a.leadId);
        });
        waSendLogs.forEach(log => {
            const uid = log.quotation?.createdById;
            if (uid && userMap.has(uid)) {
                userMap.get(uid).quotationsSentViaWA++;
            }
        });
        const userStats = [...userMap.entries()].map(([userId, d]) => ({
            userId, name: d.name, whatsappActivities: d.activities,
            leadsContacted: d.leadIds.size, quotationsSentViaWA: d.quotationsSentViaWA,
        })).sort((a, b) => b.whatsappActivities - a.whatsappActivities);
        const topUser = userStats[0]?.name || 'N/A';
        const allLeadIds = new Set();
        waActivities.forEach(a => { if (a.leadId)
            allLeadIds.add(a.leadId); });
        const totalLeads = await this.prisma.working.lead.count({
            where: { tenantId: params.tenantId, createdAt: { lte: params.dateTo } },
        });
        const leadTouchRate = totalLeads > 0
            ? Math.round((allLeadIds.size / totalLeads) * 10000) / 100
            : 0;
        const dailyMap = new Map();
        waActivities.forEach(a => {
            const day = a.createdAt.toISOString().slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        });
        const sortedDays = [...dailyMap.keys()].sort();
        const summary = [
            { key: 'totalWhatsAppActivities', label: 'Total WhatsApp Activities', value: totalWhatsAppActivities, format: 'number' },
            { key: 'avgPerDay', label: 'Avg per Day', value: avgPerDay, format: 'number' },
            { key: 'topUserCount', label: 'Top User Count', value: userStats[0]?.whatsappActivities || 0, format: 'number' },
            { key: 'leadTouchRate', label: 'Lead Touch Rate', value: leadTouchRate, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'WhatsApp Activity by User',
                labels: userStats.map(u => u.name),
                datasets: [{ label: 'Activities', data: userStats.map(u => u.whatsappActivities), color: '#25D366' }],
            },
            {
                type: 'LINE', title: 'Daily WhatsApp Trend',
                labels: sortedDays,
                datasets: [{ label: 'Activities', data: sortedDays.map(d => dailyMap.get(d)), color: '#128C7E' }],
            },
        ];
        const tableCols = [
            { key: 'name', header: 'User', width: 22 },
            { key: 'whatsappActivities', header: 'WA Activities', width: 14, format: 'number' },
            { key: 'leadsContacted', header: 'Leads Contacted', width: 16, format: 'number' },
            { key: 'quotationsSentViaWA', header: 'Quotations via WA', width: 18, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Per User WhatsApp Metrics', columns: tableCols, rows: userStats }],
            metadata: { topUser },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            type: 'WHATSAPP',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user')
            where.createdById = params.value;
        const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.WhatsAppPerformanceReport = WhatsAppPerformanceReport;
exports.WhatsAppPerformanceReport = WhatsAppPerformanceReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], WhatsAppPerformanceReport);
//# sourceMappingURL=whatsapp-performance.report.js.map