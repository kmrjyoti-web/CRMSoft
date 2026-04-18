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
exports.DemoSummaryReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const DEMO_STATUSES = ['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
let DemoSummaryReport = class DemoSummaryReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'DEMO_SUMMARY';
        this.name = 'Demo Summary';
        this.category = 'DEMO';
        this.description = 'Comprehensive overview of demo activities by status, mode, and user with monthly trends';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'status', label: 'Status', type: 'multi_select', options: DEMO_STATUSES.map(s => ({ value: s, label: s })) },
            { key: 'mode', label: 'Mode', type: 'select', options: [
                    { value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' },
                ] },
            { key: 'conductedById', label: 'Conducted By', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.conductedById = params.userId;
        if (params.filters?.status)
            where.status = { in: params.filters.status };
        if (params.filters?.mode)
            where.mode = params.filters.mode;
        const demos = await this.prisma.working.demo.findMany({
            where,
            select: {
                id: true, status: true, mode: true, duration: true,
                scheduledAt: true, completedAt: true,
                conductedBy: { select: { firstName: true, lastName: true } },
            },
        });
        const totalDemos = demos.length;
        const completedCount = demos.filter(d => d.status === 'COMPLETED').length;
        const cancelledCount = demos.filter(d => d.status === 'CANCELLED').length;
        const noShowCount = demos.filter(d => d.status === 'NO_SHOW').length;
        const completionRate = totalDemos > 0
            ? Math.round((completedCount / totalDemos) * 10000) / 100
            : 0;
        const durations = demos.filter(d => d.duration != null).map(d => d.duration);
        const avgDuration = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;
        const summary = [
            { key: 'totalDemos', label: 'Total Demos', value: totalDemos, format: 'number' },
            { key: 'completedCount', label: 'Completed', value: completedCount, format: 'number' },
            { key: 'completionRate', label: 'Completion Rate', value: completionRate, format: 'percent' },
            { key: 'avgDuration', label: 'Avg Duration (min)', value: avgDuration, format: 'number' },
            { key: 'cancelledCount', label: 'Cancelled', value: cancelledCount, format: 'number' },
            { key: 'noShowCount', label: 'No Shows', value: noShowCount, format: 'number' },
        ];
        const statusCounts = new Map();
        DEMO_STATUSES.forEach(s => statusCounts.set(s, 0));
        demos.forEach(d => statusCounts.set(d.status, (statusCounts.get(d.status) || 0) + 1));
        const activeStatuses = [...statusCounts.entries()].filter(([, v]) => v > 0);
        const userMap = new Map();
        demos.forEach(d => {
            const name = `${d.conductedBy.firstName} ${d.conductedBy.lastName}`;
            userMap.set(name, (userMap.get(name) || 0) + 1);
        });
        const usersSorted = [...userMap.entries()].sort((a, b) => b[1] - a[1]);
        const charts = [
            {
                type: 'PIE', title: 'Demos by Status',
                labels: activeStatuses.map(([s]) => s),
                datasets: [{ label: 'Count', data: activeStatuses.map(([, v]) => v) }],
            },
            {
                type: 'BAR', title: 'Demos by User',
                labels: usersSorted.map(u => u[0]),
                datasets: [{ label: 'Demos', data: usersSorted.map(u => u[1]), color: '#3F51B5' }],
            },
        ];
        const monthMap = new Map();
        demos.forEach(d => {
            const month = `${d.scheduledAt.getFullYear()}-${String(d.scheduledAt.getMonth() + 1).padStart(2, '0')}`;
            if (!monthMap.has(month))
                monthMap.set(month, { scheduled: 0, completed: 0, cancelled: 0, noShow: 0 });
            const entry = monthMap.get(month);
            entry.scheduled++;
            if (d.status === 'COMPLETED')
                entry.completed++;
            if (d.status === 'CANCELLED')
                entry.cancelled++;
            if (d.status === 'NO_SHOW')
                entry.noShow++;
        });
        const monthlyRows = [...monthMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({
            month,
            ...data,
            completionRate: data.scheduled > 0
                ? Math.round((data.completed / data.scheduled) * 10000) / 100
                : 0,
        }));
        const tableColumns = [
            { key: 'month', header: 'Month', width: 12 },
            { key: 'scheduled', header: 'Scheduled', width: 12, format: 'number' },
            { key: 'completed', header: 'Completed', width: 12, format: 'number' },
            { key: 'cancelled', header: 'Cancelled', width: 12, format: 'number' },
            { key: 'noShow', header: 'No Show', width: 10, format: 'number' },
            { key: 'completionRate', header: 'Completion %', width: 14, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Monthly Demo Summary', columns: tableColumns, rows: monthlyRows }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'status')
            where.status = params.value;
        const result = await this.drillDownSvc.getDemos(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.DemoSummaryReport = DemoSummaryReport;
exports.DemoSummaryReport = DemoSummaryReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], DemoSummaryReport);
//# sourceMappingURL=demo-summary.report.js.map