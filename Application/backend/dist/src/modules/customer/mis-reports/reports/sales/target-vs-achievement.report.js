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
exports.TargetVsAchievementReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let TargetVsAchievementReport = class TargetVsAchievementReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'TARGET_VS_ACHIEVEMENT';
        this.name = 'Target vs Achievement';
        this.category = 'SALES';
        this.description = 'Compare sales targets against actual achievements with projected outcomes';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'userId', label: 'Sales Rep', type: 'user' },
            { key: 'metric', label: 'Target Metric', type: 'select', options: [
                    { value: 'REVENUE', label: 'Revenue' }, { value: 'DEALS_WON', label: 'Deals Won' },
                    { value: 'LEADS_CREATED', label: 'Leads Created' },
                ] },
            { key: 'status', label: 'Target Status', type: 'select', options: [
                    { value: 'ON_TRACK', label: 'On Track' }, { value: 'AT_RISK', label: 'At Risk' },
                    { value: 'BEHIND', label: 'Behind' }, { value: 'ACHIEVED', label: 'Achieved' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            isActive: true,
            periodStart: { lte: params.dateTo },
            periodEnd: { gte: params.dateFrom },
        };
        if (params.userId)
            where.userId = params.userId;
        if (params.filters?.metric)
            where.metric = params.filters.metric;
        const targets = await this.prisma.working.salesTarget.findMany({ where });
        const userIds = [...new Set(targets.filter(t => t.userId).map(t => t.userId))];
        const users = userIds.length > 0
            ? await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, firstName: true, lastName: true },
            })
            : [];
        const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
        const now = new Date();
        const totalTargets = targets.length;
        let achievedCount = 0;
        let onTrackCount = 0;
        const achievedPercents = [];
        const rows = targets.map(t => {
            const targetVal = Number(t.targetValue);
            const currentVal = Number(t.currentValue);
            const achievedPct = Number(t.achievedPercent);
            achievedPercents.push(achievedPct);
            const periodStart = new Date(t.periodStart);
            const periodEnd = new Date(t.periodEnd);
            const totalDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / 86400000);
            const elapsed = Math.max(1, (Math.min(now.getTime(), periodEnd.getTime()) - periodStart.getTime()) / 86400000);
            const projected = Math.round((currentVal / elapsed) * totalDays);
            let status;
            if (achievedPct >= 100) {
                status = 'ACHIEVED';
                achievedCount++;
                onTrackCount++;
            }
            else if (projected >= targetVal) {
                status = 'ON_TRACK';
                onTrackCount++;
            }
            else if (projected >= targetVal * 0.7) {
                status = 'AT_RISK';
            }
            else {
                status = 'BEHIND';
            }
            return {
                userName: t.userId ? (userMap.get(t.userId) || 'Unknown') : 'Team',
                metric: t.metric,
                name: t.name || t.metric,
                target: targetVal,
                current: currentVal,
                achievedPercent: achievedPct,
                projected,
                status,
            };
        });
        const filteredRows = params.filters?.status
            ? rows.filter(r => r.status === params.filters.status)
            : rows;
        const avgAchievedPercent = achievedPercents.length > 0
            ? Math.round(achievedPercents.reduce((a, b) => a + b, 0) / achievedPercents.length * 100) / 100
            : 0;
        const summary = [
            { key: 'totalTargets', label: 'Total Targets', value: totalTargets, format: 'number' },
            { key: 'onTrack', label: 'On Track', value: onTrackCount, format: 'number' },
            { key: 'achieved', label: 'Achieved', value: achievedCount, format: 'number' },
            { key: 'avgAchievedPercent', label: 'Avg Achievement', value: avgAchievedPercent, format: 'percent' },
        ];
        const userLabels = filteredRows.map(r => r.userName);
        const targetVsCurrentChart = {
            type: 'BAR', title: 'Target vs Current Achievement',
            labels: userLabels,
            datasets: [
                { label: 'Target', data: filteredRows.map(r => r.target), color: '#90CAF9' },
                { label: 'Current', data: filteredRows.map(r => r.current), color: '#4CAF50' },
            ],
        };
        const tableCols = [
            { key: 'userName', header: 'User', width: 20 },
            { key: 'name', header: 'Target Name', width: 18 },
            { key: 'metric', header: 'Metric', width: 14 },
            { key: 'target', header: 'Target', width: 14, format: 'number' },
            { key: 'current', header: 'Current', width: 14, format: 'number' },
            { key: 'achievedPercent', header: 'Achieved %', width: 12, format: 'percent' },
            { key: 'projected', header: 'Projected', width: 14, format: 'number' },
            { key: 'status', header: 'Status', width: 12 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [targetVsCurrentChart],
            tables: [{ title: 'Target vs Achievement Details', columns: tableCols, rows: filteredRows }],
        };
    }
};
exports.TargetVsAchievementReport = TargetVsAchievementReport;
exports.TargetVsAchievementReport = TargetVsAchievementReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], TargetVsAchievementReport);
//# sourceMappingURL=target-vs-achievement.report.js.map