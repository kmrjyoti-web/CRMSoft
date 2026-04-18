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
exports.CallLogReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let CallLogReport = class CallLogReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CALL_LOG';
        this.name = 'Call Log';
        this.category = 'ACTIVITY';
        this.description = 'Detailed call activity analysis including duration, outcomes, and daily call volume trends';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'createdById', label: 'Performed By', type: 'user' },
            { key: 'outcome', label: 'Outcome', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            type: 'CALL',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        if (params.filters?.outcome)
            where.outcome = params.filters.outcome;
        const calls = await this.prisma.working.activity.findMany({
            where,
            select: {
                id: true, subject: true, outcome: true, duration: true,
                createdAt: true,
                lead: { select: { leadNumber: true } },
                createdByUser: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalCalls = calls.length;
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const callsPerDay = Math.round((totalCalls / dayCount) * 100) / 100;
        const durations = calls.filter(c => c.duration != null).map(c => c.duration);
        const avgDuration = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;
        const outcomeCounts = new Map();
        calls.forEach(c => {
            const outcome = c.outcome || 'No Outcome';
            outcomeCounts.set(outcome, (outcomeCounts.get(outcome) || 0) + 1);
        });
        const outcomeLabels = [...outcomeCounts.keys()];
        const topOutcome = outcomeLabels.sort((a, b) => outcomeCounts.get(b) - outcomeCounts.get(a))[0] || 'N/A';
        const dailyMap = new Map();
        calls.forEach(c => {
            const day = c.createdAt.toISOString().slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        });
        const sortedDays = [...dailyMap.keys()].sort();
        const summary = [
            { key: 'totalCalls', label: 'Total Calls', value: totalCalls, format: 'number' },
            { key: 'avgDuration', label: 'Avg Duration (min)', value: avgDuration, format: 'number' },
            { key: 'topOutcome', label: 'Top Outcome Count', value: outcomeCounts.get(topOutcome) || 0, format: 'number' },
            { key: 'callsPerDay', label: 'Calls per Day', value: callsPerDay, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Calls per Day',
                labels: sortedDays,
                datasets: [{ label: 'Calls', data: sortedDays.map(d => dailyMap.get(d)), color: '#2196F3' }],
            },
            {
                type: 'PIE', title: 'Calls by Outcome',
                labels: outcomeLabels,
                datasets: [{ label: 'Count', data: outcomeLabels.map(o => outcomeCounts.get(o)) }],
            },
        ];
        const tableRows = calls.map(c => ({
            date: c.createdAt,
            subject: c.subject,
            outcome: c.outcome || '',
            duration: c.duration || 0,
            performedBy: `${c.createdByUser.firstName} ${c.createdByUser.lastName}`,
            leadNumber: c.lead?.leadNumber || '',
        }));
        const tableColumns = [
            { key: 'date', header: 'Date', width: 15, format: 'date' },
            { key: 'subject', header: 'Subject', width: 25 },
            { key: 'outcome', header: 'Outcome', width: 18 },
            { key: 'duration', header: 'Duration (min)', width: 14, format: 'number' },
            { key: 'performedBy', header: 'Performed By', width: 20 },
            { key: 'leadNumber', header: 'Lead #', width: 16 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Call Records', columns: tableColumns, rows: tableRows }],
            metadata: { topOutcome },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            type: 'CALL',
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'outcome') {
            where.outcome = params.value === 'No Outcome' ? null : params.value;
        }
        const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.CallLogReport = CallLogReport;
exports.CallLogReport = CallLogReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], CallLogReport);
//# sourceMappingURL=call-log.report.js.map