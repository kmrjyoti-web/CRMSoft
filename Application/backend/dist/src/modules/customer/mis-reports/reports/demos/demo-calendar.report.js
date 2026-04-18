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
exports.DemoCalendarReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let DemoCalendarReport = class DemoCalendarReport {
    constructor(prisma) {
        this.prisma = prisma;
        this.code = 'DEMO_CALENDAR';
        this.name = 'Demo Calendar';
        this.category = 'DEMO';
        this.description = 'Daily demo schedule view with per-user load distribution and capacity insights';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'conductedById', label: 'Conducted By', type: 'user' },
            { key: 'mode', label: 'Mode', type: 'select', options: [
                    { value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.conductedById = params.userId;
        if (params.filters?.mode)
            where.mode = params.filters.mode;
        const demos = await this.prisma.working.demo.findMany({
            where,
            select: {
                id: true, status: true, mode: true, scheduledAt: true,
                conductedBy: { select: { id: true, firstName: true, lastName: true } },
                lead: { select: { leadNumber: true } },
            },
            orderBy: { scheduledAt: 'asc' },
        });
        const totalDemos = demos.length;
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const avgPerDay = Math.round((totalDemos / dayCount) * 100) / 100;
        const dailyMap = new Map();
        demos.forEach(d => {
            const day = d.scheduledAt.toISOString().slice(0, 10);
            if (!dailyMap.has(day))
                dailyMap.set(day, []);
            dailyMap.get(day).push(d);
        });
        const sortedDays = [...dailyMap.keys()].sort();
        const dailyCounts = sortedDays.map(d => dailyMap.get(d).length);
        const peakDayIdx = dailyCounts.indexOf(Math.max(...dailyCounts, 0));
        const peakDay = sortedDays[peakDayIdx] || 'N/A';
        const userMap = new Map();
        demos.forEach(d => {
            const userId = d.conductedBy.id;
            const name = `${d.conductedBy.firstName} ${d.conductedBy.lastName}`;
            if (!userMap.has(userId))
                userMap.set(userId, { name, count: 0 });
            userMap.get(userId).count++;
        });
        const usersSorted = [...userMap.values()].sort((a, b) => b.count - a.count);
        const busiestUser = usersSorted[0]?.name || 'N/A';
        const summary = [
            { key: 'totalDemos', label: 'Total Demos', value: totalDemos, format: 'number' },
            { key: 'avgPerDay', label: 'Avg per Day', value: avgPerDay, format: 'number' },
            { key: 'peakDay', label: 'Peak Day Count', value: dailyCounts[peakDayIdx] || 0, format: 'number' },
            { key: 'busiestUser', label: 'Busiest User Count', value: usersSorted[0]?.count || 0, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Daily Demo Count',
                labels: sortedDays,
                datasets: [{ label: 'Demos', data: dailyCounts, color: '#FF5722' }],
            },
            {
                type: 'BAR', title: 'Demos per User',
                labels: usersSorted.map(u => u.name),
                datasets: [{ label: 'Demos', data: usersSorted.map(u => u.count), color: '#9C27B0' }],
            },
        ];
        const calendarRows = sortedDays.map(day => {
            const dayDemos = dailyMap.get(day);
            return {
                date: day,
                count: dayDemos.length,
                demos: dayDemos.map(d => ({
                    time: d.scheduledAt.toISOString().slice(11, 16),
                    lead: d.lead?.leadNumber || '',
                    user: `${d.conductedBy.firstName} ${d.conductedBy.lastName}`,
                    status: d.status,
                    mode: d.mode,
                })),
            };
        });
        const tableColumns = [
            { key: 'date', header: 'Date', width: 12, format: 'date' },
            { key: 'count', header: 'Demo Count', width: 12, format: 'number' },
            { key: 'demos', header: 'Demo Details', width: 50 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Demo Calendar', columns: tableColumns, rows: calendarRows }],
            metadata: { peakDay, busiestUser },
        };
    }
};
exports.DemoCalendarReport = DemoCalendarReport;
exports.DemoCalendarReport = DemoCalendarReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DemoCalendarReport);
//# sourceMappingURL=demo-calendar.report.js.map