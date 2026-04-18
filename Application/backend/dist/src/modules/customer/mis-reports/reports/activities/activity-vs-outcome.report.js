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
exports.ActivityVsOutcomeReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const BUCKETS = [
    { key: '0-2', min: 0, max: 2 },
    { key: '3-5', min: 3, max: 5 },
    { key: '6-10', min: 6, max: 10 },
    { key: '10+', min: 11, max: Infinity },
];
let ActivityVsOutcomeReport = class ActivityVsOutcomeReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'ACTIVITY_VS_OUTCOME';
        this.name = 'Activity vs Outcome';
        this.category = 'ACTIVITY';
        this.description = 'Correlates activity volume per lead with lead outcomes to identify optimal engagement levels';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        const leads = await this.prisma.working.lead.findMany({
            where,
            select: {
                id: true, status: true,
                _count: { select: { activities: true } },
            },
        });
        const wonLeads = leads.filter(l => l.status === 'WON');
        const lostLeads = leads.filter(l => l.status === 'LOST');
        const activeLeads = leads.filter(l => l.status !== 'WON' && l.status !== 'LOST');
        const avgActivities = (arr) => arr.length > 0
            ? Math.round((arr.reduce((s, l) => s + l._count.activities, 0) / arr.length) * 100) / 100
            : 0;
        const avgActivitiesWon = avgActivities(wonLeads);
        const avgActivitiesLost = avgActivities(lostLeads);
        const avgActivitiesActive = avgActivities(activeLeads);
        const correlationInsight = avgActivitiesWon > avgActivitiesLost
            ? 'Higher activity count correlates with wins'
            : avgActivitiesWon < avgActivitiesLost
                ? 'Activity count alone does not drive wins'
                : 'No clear correlation between activity count and outcome';
        let activityThreshold = 0;
        for (let threshold = 1; threshold <= 20; threshold++) {
            const aboveThreshold = leads.filter(l => l._count.activities >= threshold);
            const winsAbove = aboveThreshold.filter(l => l.status === 'WON').length;
            if (aboveThreshold.length > 0 && (winsAbove / aboveThreshold.length) > 0.5) {
                activityThreshold = threshold;
                break;
            }
        }
        const bucketStats = BUCKETS.map(bucket => {
            const inBucket = leads.filter(l => l._count.activities >= bucket.min && l._count.activities <= bucket.max);
            const wonCount = inBucket.filter(l => l.status === 'WON').length;
            const lostCount = inBucket.filter(l => l.status === 'LOST').length;
            const winRate = (wonCount + lostCount) > 0
                ? Math.round((wonCount / (wonCount + lostCount)) * 10000) / 100
                : 0;
            return {
                bucket: bucket.key,
                totalLeads: inBucket.length,
                wonCount,
                lostCount,
                activeCount: inBucket.length - wonCount - lostCount,
                winRate,
            };
        });
        const summary = [
            { key: 'avgActivitiesWon', label: 'Avg Activities (Won)', value: avgActivitiesWon, format: 'number' },
            { key: 'avgActivitiesLost', label: 'Avg Activities (Lost)', value: avgActivitiesLost, format: 'number' },
            { key: 'correlationInsight', label: 'Total Leads Analyzed', value: leads.length, format: 'number' },
            { key: 'activityThreshold', label: 'Activity Threshold (>50% Win)', value: activityThreshold, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Average Activities by Lead Outcome',
                labels: ['Won', 'Lost', 'Active'],
                datasets: [{
                        label: 'Avg Activities',
                        data: [avgActivitiesWon, avgActivitiesLost, avgActivitiesActive],
                        color: '#009688',
                    }],
            },
        ];
        const tableColumns = [
            { key: 'bucket', header: 'Activity Bucket', width: 16 },
            { key: 'totalLeads', header: 'Total Leads', width: 12, format: 'number' },
            { key: 'wonCount', header: 'Won', width: 10, format: 'number' },
            { key: 'lostCount', header: 'Lost', width: 10, format: 'number' },
            { key: 'activeCount', header: 'Active', width: 10, format: 'number' },
            { key: 'winRate', header: 'Win Rate', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Activity Bucket Analysis', columns: tableColumns, rows: bucketStats }],
            metadata: { correlationInsight, activityThreshold },
        };
    }
    async drillDown(params) {
        const bucket = BUCKETS.find(b => b.key === params.value);
        if (!bucket) {
            return {
                dimension: params.dimension, value: params.value,
                columns: [], rows: [], total: 0, page: params.page, limit: params.limit,
            };
        }
        const leads = await this.prisma.working.lead.findMany({
            where: {
                tenantId: params.filters?.tenantId,
                createdAt: { gte: params.dateFrom, lte: params.dateTo },
            },
            select: {
                id: true, _count: { select: { activities: true } },
            },
        });
        const leadIds = leads
            .filter(l => l._count.activities >= bucket.min && l._count.activities <= bucket.max)
            .map(l => l.id);
        const where = {
            tenantId: params.filters?.tenantId,
            id: { in: leadIds },
        };
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.ActivityVsOutcomeReport = ActivityVsOutcomeReport;
exports.ActivityVsOutcomeReport = ActivityVsOutcomeReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ActivityVsOutcomeReport);
//# sourceMappingURL=activity-vs-outcome.report.js.map