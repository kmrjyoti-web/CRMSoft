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
exports.ActivitySummaryReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP', 'SMS', 'VISIT'];
let ActivitySummaryReport = class ActivitySummaryReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'ACTIVITY_SUMMARY';
        this.name = 'Activity Summary';
        this.category = 'ACTIVITY';
        this.description = 'Overview of all activities by type and user with daily breakdown and volume trends';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'type', label: 'Activity Type', type: 'multi_select', options: ACTIVITY_TYPES.map(t => ({ value: t, label: t })) },
            { key: 'createdById', label: 'Performed By', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        if (params.filters?.type)
            where.type = { in: params.filters.type };
        const activities = await this.prisma.working.activity.findMany({
            where,
            select: {
                id: true, type: true, createdAt: true,
                createdByUser: { select: { firstName: true, lastName: true } },
            },
        });
        const totalActivities = activities.length;
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const avgPerDay = Math.round((totalActivities / dayCount) * 100) / 100;
        const typeCounts = new Map();
        ACTIVITY_TYPES.forEach(t => typeCounts.set(t, 0));
        activities.forEach(a => typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1));
        const mostCommonType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const dailyMap = new Map();
        activities.forEach(a => {
            const day = a.createdAt.toISOString().slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
        });
        const peakDayEntry = [...dailyMap.entries()].sort((a, b) => b[1] - a[1])[0];
        const peakDay = peakDayEntry ? peakDayEntry[0] : 'N/A';
        const userMap = new Map();
        activities.forEach(a => {
            const name = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
            userMap.set(name, (userMap.get(name) || 0) + 1);
        });
        const usersSorted = [...userMap.entries()].sort((a, b) => b[1] - a[1]);
        const top15Users = usersSorted.slice(0, 15);
        const summary = [
            { key: 'totalActivities', label: 'Total Activities', value: totalActivities, format: 'number' },
            { key: 'avgPerDay', label: 'Avg per Day', value: avgPerDay, format: 'number' },
            { key: 'peakDay', label: 'Peak Day Count', value: peakDayEntry?.[1] || 0, format: 'number' },
            { key: 'mostCommonType', label: 'Most Common Type Count', value: typeCounts.get(mostCommonType) || 0, format: 'number' },
        ];
        const typeLabels = [...typeCounts.keys()].filter(t => typeCounts.get(t) > 0);
        const charts = [
            {
                type: 'PIE', title: 'Activities by Type',
                labels: typeLabels,
                datasets: [{ label: 'Count', data: typeLabels.map(t => typeCounts.get(t)) }],
            },
            {
                type: 'BAR', title: 'Activities by User (Top 15)',
                labels: top15Users.map(u => u[0]),
                datasets: [{ label: 'Activities', data: top15Users.map(u => u[1]), color: '#FF9800' }],
            },
        ];
        const sortedDays = [...dailyMap.keys()].sort();
        const dailyRows = sortedDays.map(day => {
            const dayActivities = activities.filter(a => a.createdAt.toISOString().slice(0, 10) === day);
            const row = { date: day, total: dayActivities.length };
            ACTIVITY_TYPES.forEach(t => {
                row[t.toLowerCase()] = dayActivities.filter(a => a.type === t).length;
            });
            return row;
        });
        const tableColumns = [
            { key: 'date', header: 'Date', width: 12, format: 'date' },
            ...ACTIVITY_TYPES.map(t => ({ key: t.toLowerCase(), header: t, width: 10, format: 'number' })),
            { key: 'total', header: 'Total', width: 10, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Daily Activity Summary', columns: tableColumns, rows: dailyRows }],
            metadata: { peakDay, mostCommonType },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'type')
            where.type = params.value;
        const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.ActivitySummaryReport = ActivitySummaryReport;
exports.ActivitySummaryReport = ActivitySummaryReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ActivitySummaryReport);
//# sourceMappingURL=activity-summary.report.js.map