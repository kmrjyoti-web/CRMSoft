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
exports.WorkloadDistributionReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let WorkloadDistributionReport = class WorkloadDistributionReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'WORKLOAD_DISTRIBUTION';
        this.name = 'Workload Distribution';
        this.category = 'TEAM';
        this.description = 'Visualizes active workload per team member with overload detection and rebalance suggestions';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'maxLeads', label: 'Max Leads per User', type: 'text' },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const maxLeads = Number(params.filters?.maxLeads) || 50;
        const users = await this.prisma.user.findMany({
            where: { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' },
            select: { id: true, firstName: true, lastName: true },
        });
        const userIds = users.map(u => u.id);
        const [activeLeads, activeDemos, activeQuotations, lastActivities] = await Promise.all([
            this.prisma.working.lead.findMany({
                where: { tenantId, allocatedToId: { in: userIds }, status: { notIn: ['WON', 'LOST'] } },
                select: { allocatedToId: true },
            }),
            this.prisma.working.demo.findMany({
                where: { tenantId, conductedById: { in: userIds }, status: 'SCHEDULED' },
                select: { conductedById: true },
            }),
            this.prisma.working.quotation.findMany({
                where: { tenantId, createdById: { in: userIds }, status: { in: ['SENT', 'VIEWED'] } },
                select: { createdById: true },
            }),
            this.prisma.working.activity.findMany({
                where: { tenantId, createdById: { in: userIds } },
                orderBy: { createdAt: 'desc' },
                distinct: ['createdById'],
                select: { createdById: true, createdAt: true },
            }),
        ]);
        const lastActivityMap = new Map(lastActivities.map(a => [a.createdById, a.createdAt]));
        const getStatus = (pct) => {
            if (pct > 90)
                return 'CRITICAL';
            if (pct > 75)
                return 'OVERLOADED';
            if (pct > 50)
                return 'HEAVY';
            return 'NORMAL';
        };
        const getColor = (status) => {
            if (status === 'CRITICAL')
                return '#F44336';
            if (status === 'OVERLOADED')
                return '#FF9800';
            if (status === 'HEAVY')
                return '#FFC107';
            return '#4CAF50';
        };
        const userStats = users.map(u => {
            const leadCount = activeLeads.filter(l => l.allocatedToId === u.id).length;
            const loadPercent = Math.round((leadCount / maxLeads) * 10000) / 100;
            const status = getStatus(loadPercent);
            const demoCount = activeDemos.filter(d => d.conductedById === u.id).length;
            const quotationCount = activeQuotations.filter(q => q.createdById === u.id).length;
            const lastActivityAt = lastActivityMap.get(u.id) || null;
            return {
                userId: u.id, userName: `${u.firstName} ${u.lastName}`,
                activeLeads: leadCount, maxLeads, loadPercent, status,
                activeDemos: demoCount, activeQuotations: quotationCount, lastActivityAt,
            };
        });
        userStats.sort((a, b) => b.loadPercent - a.loadPercent);
        const overloaded = userStats.filter(u => u.status === 'CRITICAL' || u.status === 'OVERLOADED');
        const underloaded = userStats.filter(u => u.loadPercent < 25);
        const suggestions = [];
        overloaded.forEach(over => {
            const excess = over.activeLeads - Math.round(maxLeads * 0.6);
            if (excess > 0 && underloaded.length > 0) {
                const target = underloaded.find(u => u.loadPercent < 40) || underloaded[0];
                const transfer = Math.min(excess, Math.round(maxLeads * 0.2));
                suggestions.push({
                    from: over.userName, to: target.userName, leadsToTransfer: transfer,
                    reason: `${over.userName} is ${over.status} at ${over.loadPercent}% while ${target.userName} is at ${target.loadPercent}%`,
                });
            }
        });
        const totalUsers = userStats.length;
        const overloadedCount = overloaded.length;
        const underutilized = underloaded.length;
        const avgLoad = totalUsers > 0
            ? Math.round(userStats.reduce((s, u) => s + u.loadPercent, 0) / totalUsers * 100) / 100
            : 0;
        const summary = [
            { key: 'totalUsers', label: 'Total Users', value: totalUsers, format: 'number' },
            { key: 'overloaded', label: 'Overloaded', value: overloadedCount, format: 'number' },
            { key: 'underutilized', label: 'Underutilized', value: underutilized, format: 'number' },
            { key: 'avgLoad', label: 'Avg Load %', value: avgLoad, format: 'percent' },
        ];
        const charts = [{
                type: 'BAR', title: 'Workload per User',
                labels: userStats.map(u => u.userName),
                datasets: [{
                        label: 'Load %',
                        data: userStats.map(u => u.loadPercent),
                        color: userStats.length > 0 ? getColor(userStats[0].status) : '#4CAF50',
                    }],
            }];
        const columns = [
            { key: 'userName', header: 'Employee', width: 20 },
            { key: 'activeLeads', header: 'Active Leads', width: 12, format: 'number' },
            { key: 'maxLeads', header: 'Max Leads', width: 10, format: 'number' },
            { key: 'loadPercent', header: 'Load %', width: 10, format: 'percent' },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'activeDemos', header: 'Demos', width: 8, format: 'number' },
            { key: 'activeQuotations', header: 'Quotes', width: 8, format: 'number' },
            { key: 'lastActivityAt', header: 'Last Activity', width: 15, format: 'date' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Workload Distribution', columns, rows: userStats }],
            metadata: { suggestions, maxLeads },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            status: { notIn: ['WON', 'LOST'] },
        };
        if (params.dimension === 'user')
            where.allocatedToId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.WorkloadDistributionReport = WorkloadDistributionReport;
exports.WorkloadDistributionReport = WorkloadDistributionReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], WorkloadDistributionReport);
//# sourceMappingURL=workload-distribution.report.js.map