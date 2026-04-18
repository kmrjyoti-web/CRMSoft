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
exports.NoShowAnalysisReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let NoShowAnalysisReport = class NoShowAnalysisReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'NO_SHOW_ANALYSIS';
        this.name = 'No-Show Analysis';
        this.category = 'DEMO';
        this.description = 'Analyzes demo no-show patterns by day, time, and mode with actionable suggestions';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'conductedById', label: 'Conducted By', type: 'user' },
            { key: 'mode', label: 'Mode', type: 'select', options: [
                    { value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' },
                ] },
        ];
    }
    async generate(params) {
        const baseWhere = {
            tenantId: params.tenantId,
            scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            baseWhere.conductedById = params.userId;
        if (params.filters?.mode)
            baseWhere.mode = params.filters.mode;
        const allDemos = await this.prisma.working.demo.count({ where: baseWhere });
        const noShows = await this.prisma.working.demo.findMany({
            where: { ...baseWhere, status: 'NO_SHOW' },
            select: {
                id: true, mode: true, scheduledAt: true, noShowReason: true,
                lead: { select: { leadNumber: true } },
                conductedBy: { select: { firstName: true, lastName: true } },
            },
            orderBy: { scheduledAt: 'desc' },
        });
        const totalNoShows = noShows.length;
        const noShowRate = allDemos > 0
            ? Math.round((totalNoShows / allDemos) * 10000) / 100
            : 0;
        const dayMap = new Map();
        DAYS_OF_WEEK.forEach(d => dayMap.set(d, 0));
        noShows.forEach(d => {
            const day = DAYS_OF_WEEK[d.scheduledAt.getDay()];
            dayMap.set(day, (dayMap.get(day) || 0) + 1);
        });
        const topNoShowDay = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const timeSlots = { Morning: 0, Afternoon: 0, Evening: 0 };
        noShows.forEach(d => {
            const hour = d.scheduledAt.getHours();
            if (hour < 12)
                timeSlots.Morning++;
            else if (hour < 17)
                timeSlots.Afternoon++;
            else
                timeSlots.Evening++;
        });
        const topNoShowTime = Object.entries(timeSlots)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const modeMap = new Map();
        noShows.forEach(d => {
            modeMap.set(d.mode, (modeMap.get(d.mode) || 0) + 1);
        });
        const summary = [
            { key: 'totalNoShows', label: 'Total No-Shows', value: totalNoShows, format: 'number' },
            { key: 'noShowRate', label: 'No-Show Rate', value: noShowRate, format: 'percent' },
            { key: 'topNoShowDay', label: 'Top No-Show Day Count', value: dayMap.get(topNoShowDay) || 0, format: 'number' },
            { key: 'topNoShowTime', label: 'Top No-Show Time Count', value: timeSlots[topNoShowTime] || 0, format: 'number' },
        ];
        const activeDays = DAYS_OF_WEEK.filter(d => dayMap.get(d) > 0);
        const modeLabels = [...modeMap.keys()];
        const charts = [
            {
                type: 'BAR', title: 'No-Shows by Day of Week',
                labels: activeDays,
                datasets: [{ label: 'No-Shows', data: activeDays.map(d => dayMap.get(d)), color: '#F44336' }],
            },
            {
                type: 'PIE', title: 'No-Shows by Mode',
                labels: modeLabels,
                datasets: [{ label: 'Count', data: modeLabels.map(m => modeMap.get(m)) }],
            },
        ];
        const tableRows = noShows.map(d => ({
            date: d.scheduledAt,
            dayOfWeek: DAYS_OF_WEEK[d.scheduledAt.getDay()],
            leadNumber: d.lead?.leadNumber || '',
            conductedBy: `${d.conductedBy.firstName} ${d.conductedBy.lastName}`,
            mode: d.mode,
            noShowReason: d.noShowReason || '',
        }));
        const tableColumns = [
            { key: 'date', header: 'Date', width: 15, format: 'date' },
            { key: 'dayOfWeek', header: 'Day', width: 12 },
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'conductedBy', header: 'Conducted By', width: 20 },
            { key: 'mode', header: 'Mode', width: 10 },
            { key: 'noShowReason', header: 'Reason', width: 25 },
        ];
        const suggestions = [];
        if (topNoShowDay !== 'N/A') {
            suggestions.push(`Consider sending reminder calls for ${topNoShowDay} demos as they have the highest no-show rate.`);
        }
        if (topNoShowTime === 'Morning') {
            suggestions.push('Morning demos have the most no-shows. Consider scheduling confirmation calls the evening before.');
        }
        else if (topNoShowTime === 'Evening') {
            suggestions.push('Evening demos have the most no-shows. Consider rescheduling to earlier time slots.');
        }
        const onlineCount = modeMap.get('ONLINE') || 0;
        const offlineCount = modeMap.get('OFFLINE') || 0;
        if (onlineCount > offlineCount && totalNoShows > 0) {
            suggestions.push('Online demos have more no-shows than offline. Consider sending meeting link reminders 30 minutes before.');
        }
        else if (offlineCount > onlineCount && totalNoShows > 0) {
            suggestions.push('Offline demos have more no-shows. Consider offering an online alternative option.');
        }
        if (suggestions.length === 0) {
            suggestions.push('No significant patterns detected. Continue monitoring no-show trends.');
        }
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'No-Show Records', columns: tableColumns, rows: tableRows }],
            metadata: { topNoShowDay, topNoShowTime, suggestions },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            status: 'NO_SHOW',
            scheduledAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'dayOfWeek') {
            const allNoShows = await this.prisma.working.demo.findMany({
                where,
                select: {
                    id: true, scheduledAt: true, status: true, mode: true,
                    lead: { select: { leadNumber: true } },
                    conductedBy: { select: { firstName: true, lastName: true } },
                },
                orderBy: { scheduledAt: 'desc' },
            });
            const filtered = allNoShows.filter(d => DAYS_OF_WEEK[d.scheduledAt.getDay()] === params.value);
            const total = filtered.length;
            const start = (params.page - 1) * params.limit;
            const paged = filtered.slice(start, start + params.limit);
            const columns = [
                { key: 'scheduledAt', header: 'Scheduled', width: 18, format: 'date' },
                { key: 'status', header: 'Status', width: 12 },
                { key: 'mode', header: 'Mode', width: 10 },
                { key: 'leadNumber', header: 'Lead #', width: 16 },
                { key: 'conductedBy', header: 'Conducted By', width: 20 },
            ];
            const rows = paged.map(d => ({
                scheduledAt: d.scheduledAt,
                status: d.status,
                mode: d.mode,
                leadNumber: d.lead?.leadNumber || '',
                conductedBy: `${d.conductedBy.firstName} ${d.conductedBy.lastName}`,
            }));
            return {
                dimension: params.dimension, value: params.value,
                columns, rows, total, page: params.page, limit: params.limit,
            };
        }
        const result = await this.drillDownSvc.getDemos(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.NoShowAnalysisReport = NoShowAnalysisReport;
exports.NoShowAnalysisReport = NoShowAnalysisReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], NoShowAnalysisReport);
//# sourceMappingURL=no-show-analysis.report.js.map