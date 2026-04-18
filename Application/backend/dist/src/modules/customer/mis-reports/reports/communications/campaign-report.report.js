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
exports.CampaignReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let CampaignReport = class CampaignReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CAMPAIGN_REPORT';
        this.name = 'Campaign Report';
        this.category = 'COMMUNICATION';
        this.description = 'Analyzes batch quotation sends grouped by date and user as campaigns, with channel breakdown and view rates';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'userId', label: 'User', type: 'user' },
            { key: 'channel', label: 'Channel', type: 'select', options: [
                    { value: 'EMAIL', label: 'Email' }, { value: 'WHATSAPP', label: 'WhatsApp' },
                    { value: 'PORTAL', label: 'Portal' }, { value: 'MANUAL', label: 'Manual' },
                    { value: 'DOWNLOAD', label: 'Download' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            sentAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.filters?.channel)
            where.channel = params.filters.channel;
        const sendLogs = await this.prisma.working.quotationSendLog.findMany({
            where,
            include: {
                quotation: { select: { id: true, totalAmount: true } },
            },
            orderBy: { sentAt: 'desc' },
        });
        const filtered = params.userId
            ? sendLogs.filter((l) => l.sentById === params.userId)
            : sendLogs;
        const batchMap = new Map();
        filtered.forEach((log) => {
            const date = log.sentAt.toISOString().slice(0, 10);
            const uid = log.sentById || 'unknown';
            const uName = log.sentByName || 'Unknown';
            const key = `${date}|${uid}`;
            if (!batchMap.has(key)) {
                batchMap.set(key, {
                    date, userId: uid, userName: uName,
                    quotationIds: new Set(), totalValue: 0,
                    channels: new Set(), viewedCount: 0, totalCount: 0,
                });
            }
            const batch = batchMap.get(key);
            if (log.quotation?.id)
                batch.quotationIds.add(log.quotation.id);
            batch.totalValue += Number(log.quotation?.totalAmount || 0);
            batch.channels.add(log.channel);
            batch.totalCount++;
            if (log.viewedAt)
                batch.viewedCount++;
        });
        const batches = [...batchMap.values()].map(b => ({
            date: b.date, userName: b.userName,
            quotationCount: b.quotationIds.size, totalValue: b.totalValue,
            channels: [...b.channels].join(', '),
            viewedCount: b.viewedCount, totalSent: b.totalCount,
            viewRate: b.totalCount > 0 ? Math.round((b.viewedCount / b.totalCount) * 10000) / 100 : 0,
        })).sort((a, b) => b.date.localeCompare(a.date));
        const totalBatchSends = batches.length;
        const totalQuotationsSent = filtered.length;
        const avgBatchSize = totalBatchSends > 0
            ? Math.round((totalQuotationsSent / totalBatchSends) * 100) / 100
            : 0;
        const bestBatchViewRate = batches.reduce((max, b) => Math.max(max, b.viewRate), 0);
        const channelCounts = new Map();
        filtered.forEach(log => {
            channelCounts.set(log.channel, (channelCounts.get(log.channel) || 0) + 1);
        });
        const channelLabels = [...channelCounts.keys()];
        const dailyBatchMap = new Map();
        batches.forEach(b => {
            dailyBatchMap.set(b.date, (dailyBatchMap.get(b.date) || 0) + 1);
        });
        const sortedDays = [...dailyBatchMap.keys()].sort();
        const summary = [
            { key: 'totalBatchSends', label: 'Total Batch Sends', value: totalBatchSends, format: 'number' },
            { key: 'totalQuotationsSent', label: 'Total Quotations Sent', value: totalQuotationsSent, format: 'number' },
            { key: 'avgBatchSize', label: 'Avg Batch Size', value: avgBatchSize, format: 'number' },
            { key: 'bestBatchViewRate', label: 'Best Batch View Rate', value: bestBatchViewRate, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Batch Sends Over Time',
                labels: sortedDays,
                datasets: [{ label: 'Batches', data: sortedDays.map(d => dailyBatchMap.get(d)), color: '#3F51B5' }],
            },
            {
                type: 'PIE', title: 'Sends by Channel',
                labels: channelLabels,
                datasets: [{ label: 'Count', data: channelLabels.map(c => channelCounts.get(c)) }],
            },
        ];
        const tableCols = [
            { key: 'date', header: 'Date', width: 12, format: 'date' },
            { key: 'userName', header: 'User', width: 20 },
            { key: 'quotationCount', header: 'Quotations', width: 12, format: 'number' },
            { key: 'totalValue', header: 'Total Value', width: 16, format: 'currency' },
            { key: 'channels', header: 'Channels', width: 18 },
            { key: 'viewedCount', header: 'Viewed', width: 10, format: 'number' },
            { key: 'viewRate', header: 'View Rate', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Batch Send List', columns: tableCols, rows: batches }],
        };
    }
};
exports.CampaignReport = CampaignReport;
exports.CampaignReport = CampaignReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], CampaignReport);
//# sourceMappingURL=campaign-report.report.js.map