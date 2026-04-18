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
exports.ResponseTimeReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let ResponseTimeReport = class ResponseTimeReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'RESPONSE_TIME';
        this.name = 'Response Time Analysis';
        this.category = 'TEAM';
        this.description = 'Measures time from lead allocation to first activity per team member with SLA compliance tracking';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'userId', label: 'Employee', type: 'user' },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
        const userWhere = { tenantId, status: 'ACTIVE', userType: 'EMPLOYEE' };
        if (params.userId)
            userWhere.id = params.userId;
        const users = await this.prisma.user.findMany({
            where: userWhere,
            select: { id: true, firstName: true, lastName: true },
        });
        const userIds = users.map(u => u.id);
        const leads = await this.prisma.working.lead.findMany({
            where: { tenantId, allocatedToId: { in: userIds }, allocatedAt: dateFilter },
            select: { id: true, allocatedToId: true, allocatedAt: true },
        });
        const leadIds = leads.map(l => l.id);
        const firstActivities = leadIds.length > 0
            ? await this.prisma.working.activity.findMany({
                where: { leadId: { in: leadIds } },
                orderBy: { createdAt: 'asc' },
                distinct: ['leadId'],
                select: { leadId: true, createdAt: true },
            })
            : [];
        const firstActivityMap = new Map(firstActivities.map(a => [a.leadId, a.createdAt]));
        const userResponseTimes = new Map();
        userIds.forEach(uid => userResponseTimes.set(uid, []));
        leads.forEach(l => {
            if (!l.allocatedAt || !l.allocatedToId)
                return;
            const firstAct = firstActivityMap.get(l.id);
            if (!firstAct)
                return;
            const hours = (firstAct.getTime() - l.allocatedAt.getTime()) / 3600000;
            if (hours >= 0) {
                userResponseTimes.get(l.allocatedToId)?.push(hours);
            }
        });
        const allTimes = [];
        const userStats = users.map(u => {
            const times = userResponseTimes.get(u.id) || [];
            allTimes.push(...times);
            const sorted = [...times].sort((a, b) => a - b);
            const total = times.length;
            const avgHours = total > 0 ? Math.round(times.reduce((s, v) => s + v, 0) / total * 100) / 100 : 0;
            const medianHours = total > 0 ? Math.round(sorted[Math.floor(total / 2)] * 100) / 100 : 0;
            const within1Hr = times.filter(t => t <= 1).length;
            const within4Hr = times.filter(t => t <= 4).length;
            const within24Hr = times.filter(t => t <= 24).length;
            const over24Hr = times.filter(t => t > 24).length;
            const slaCompliance = total > 0 ? Math.round((within4Hr / total) * 10000) / 100 : 0;
            return {
                userId: u.id, userName: `${u.firstName} ${u.lastName}`,
                totalLeads: total, avgResponseHours: avgHours, medianResponseHours: medianHours,
                within1Hour: within1Hr, within4Hours: within4Hr, within24Hours: within24Hr,
                over24Hours: over24Hr, slaCompliance,
            };
        });
        userStats.sort((a, b) => a.avgResponseHours - b.avgResponseHours);
        const teamAvg = allTimes.length > 0
            ? Math.round(allTimes.reduce((s, v) => s + v, 0) / allTimes.length * 100) / 100
            : 0;
        const teamWithin4 = allTimes.filter(t => t <= 4).length;
        const teamSla = allTimes.length > 0 ? Math.round((teamWithin4 / allTimes.length) * 10000) / 100 : 0;
        const bucket1Hr = allTimes.filter(t => t <= 1).length;
        const bucket1to4 = allTimes.filter(t => t > 1 && t <= 4).length;
        const bucket4to24 = allTimes.filter(t => t > 4 && t <= 24).length;
        const bucket24Plus = allTimes.filter(t => t > 24).length;
        const bestResponder = userStats.find(u => u.totalLeads > 0);
        const slowest = [...userStats].filter(u => u.totalLeads > 0).reverse()[0];
        const summary = [
            { key: 'teamAvgResponseHours', label: 'Team Avg Response (hrs)', value: teamAvg, format: 'number' },
            { key: 'teamSlaCompliance', label: 'Team SLA Compliance', value: teamSla, format: 'percent' },
            { key: 'bestResponderAvg', label: 'Best Responder (hrs)', value: bestResponder?.avgResponseHours || 0, format: 'number' },
            { key: 'slowestResponderAvg', label: 'Slowest Responder (hrs)', value: slowest?.avgResponseHours || 0, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Avg Response Time by User',
                labels: userStats.map(u => u.userName),
                datasets: [{ label: 'Avg Hours', data: userStats.map(u => u.avgResponseHours), color: '#2196F3' }],
            },
            {
                type: 'PIE', title: 'Response Time Distribution',
                labels: ['< 1 hr', '1-4 hrs', '4-24 hrs', '24+ hrs'],
                datasets: [{ label: 'Leads', data: [bucket1Hr, bucket1to4, bucket4to24, bucket24Plus], color: '#4CAF50' }],
            },
        ];
        const columns = [
            { key: 'userName', header: 'Employee', width: 20 },
            { key: 'totalLeads', header: 'Leads', width: 8, format: 'number' },
            { key: 'avgResponseHours', header: 'Avg Hrs', width: 10, format: 'number' },
            { key: 'medianResponseHours', header: 'Median Hrs', width: 10, format: 'number' },
            { key: 'within1Hour', header: '< 1 hr', width: 8, format: 'number' },
            { key: 'within4Hours', header: '< 4 hrs', width: 8, format: 'number' },
            { key: 'within24Hours', header: '< 24 hrs', width: 8, format: 'number' },
            { key: 'over24Hours', header: '24+ hrs', width: 8, format: 'number' },
            { key: 'slaCompliance', header: 'SLA %', width: 9, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Response Time by Employee', columns, rows: userStats }],
            metadata: {
                bestResponder: bestResponder ? `${bestResponder.userName} (${bestResponder.avgResponseHours}h)` : 'N/A',
                slowestResponder: slowest ? `${slowest.userName} (${slowest.avgResponseHours}h)` : 'N/A',
            },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            allocatedAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user')
            where.allocatedToId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.ResponseTimeReport = ResponseTimeReport;
exports.ResponseTimeReport = ResponseTimeReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ResponseTimeReport);
//# sourceMappingURL=response-time.report.js.map