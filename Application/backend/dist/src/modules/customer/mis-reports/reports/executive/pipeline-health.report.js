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
exports.PipelineHealthReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let PipelineHealthReport = class PipelineHealthReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'PIPELINE_HEALTH';
        this.name = 'Pipeline Health';
        this.category = 'EXECUTIVE';
        this.description = 'Assesses pipeline health by identifying stuck, at-risk, and inactive deals with an overall health score';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const now = new Date();
        const fifteenDaysAgo = new Date(now.getTime() - 15 * 86400000);
        const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
        const weekFromNow = new Date(now.getTime() + 7 * 86400000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const where = {
            tenantId,
            status: { notIn: ['WON', 'LOST'] },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        const activeLeads = await this.prisma.working.lead.findMany({
            where,
            select: {
                id: true, leadNumber: true, status: true, expectedValue: true,
                expectedCloseDate: true, updatedAt: true, createdAt: true,
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
                allocatedTo: { select: { firstName: true, lastName: true } },
            },
        });
        const totalActive = activeLeads.length;
        const stuckDeals = activeLeads.filter(l => l.updatedAt < fifteenDaysAgo);
        const atRiskDeals = activeLeads.filter(l => l.expectedCloseDate && l.expectedCloseDate < now);
        const closingThisMonth = activeLeads.filter(l => l.expectedCloseDate && l.expectedCloseDate >= monthStart && l.expectedCloseDate <= monthEnd);
        const closingThisWeek = activeLeads.filter(l => l.expectedCloseDate && l.expectedCloseDate >= now && l.expectedCloseDate <= weekFromNow);
        const leadIds = activeLeads.map(l => l.id);
        const recentActivities = leadIds.length > 0
            ? await this.prisma.working.activity.findMany({
                where: { tenantId, leadId: { in: leadIds } },
                select: { leadId: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
            })
            : [];
        const lastActivityMap = new Map();
        recentActivities.forEach(a => {
            if (a.leadId && !lastActivityMap.has(a.leadId)) {
                lastActivityMap.set(a.leadId, a.createdAt);
            }
        });
        const noActivityDeals = activeLeads.filter(l => {
            const lastAct = lastActivityMap.get(l.id);
            return !lastAct || lastAct < tenDaysAgo;
        });
        const stuckPenalty = totalActive > 0 ? (stuckDeals.length / totalActive) * 33 : 0;
        const riskPenalty = totalActive > 0 ? (atRiskDeals.length / totalActive) * 33 : 0;
        const inactivityPenalty = totalActive > 0 ? (noActivityDeals.length / totalActive) * 33 : 0;
        const healthScore = Math.max(0, Math.round(100 - stuckPenalty - riskPenalty - inactivityPenalty));
        const summary = [
            { key: 'healthScore', label: 'Health Score', value: healthScore, format: 'number' },
            { key: 'stuckDeals', label: 'Stuck Deals', value: stuckDeals.length, format: 'number' },
            { key: 'atRiskDeals', label: 'At-Risk Deals', value: atRiskDeals.length, format: 'number' },
            { key: 'closingThisMonth', label: 'Closing This Month', value: closingThisMonth.length, format: 'number' },
            { key: 'noActivityDeals', label: 'No Activity (10+ days)', value: noActivityDeals.length, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Pipeline Health Indicators',
                labels: ['Stuck', 'At Risk', 'No Activity', 'Closing This Week', 'Closing This Month'],
                datasets: [{
                        label: 'Deals',
                        data: [stuckDeals.length, atRiskDeals.length, noActivityDeals.length,
                            closingThisWeek.length, closingThisMonth.length],
                        color: '#F44336',
                    }],
            },
        ];
        const dealCols = [
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'contact', header: 'Contact', width: 20 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'expectedValue', header: 'Value', width: 16, format: 'currency' },
            { key: 'allocatedTo', header: 'Owner', width: 18 },
            { key: 'daysSinceUpdate', header: 'Days Since Update', width: 18, format: 'number' },
        ];
        const mapDeals = (deals) => deals.map(l => ({
            leadNumber: l.leadNumber,
            contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
            organization: l.organization?.name || '',
            status: l.status,
            expectedValue: Number(l.expectedValue || 0),
            allocatedTo: l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : 'Unassigned',
            daysSinceUpdate: Math.floor((now.getTime() - l.updatedAt.getTime()) / 86400000),
        }));
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [
                { title: 'Stuck Deals (15+ days no update)', columns: dealCols, rows: mapDeals(stuckDeals) },
                { title: 'At-Risk Deals (past close date)', columns: dealCols, rows: mapDeals(atRiskDeals) },
            ],
            metadata: { healthScore, totalActive, closingThisWeek: closingThisWeek.length },
        };
    }
    async drillDown(params) {
        const tenantId = params.filters?.tenantId;
        const now = new Date();
        let where = { tenantId, status: { notIn: ['WON', 'LOST'] } };
        if (params.dimension === 'stuck') {
            where.updatedAt = { lt: new Date(now.getTime() - 15 * 86400000) };
        }
        else if (params.dimension === 'atRisk') {
            where.expectedCloseDate = { lt: now };
        }
        else if (params.dimension === 'noActivity') {
            const allActive = await this.prisma.working.lead.findMany({
                where, select: { id: true },
            });
            const leadIds = allActive.map(l => l.id);
            const activities = await this.prisma.working.activity.findMany({
                where: { tenantId, leadId: { in: leadIds }, createdAt: { gte: new Date(now.getTime() - 10 * 86400000) } },
                select: { leadId: true },
            });
            const activeLeadIds = new Set(activities.map(a => a.leadId));
            const inactiveIds = leadIds.filter(id => !activeLeadIds.has(id));
            where = { id: { in: inactiveIds }, tenantId };
        }
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.PipelineHealthReport = PipelineHealthReport;
exports.PipelineHealthReport = PipelineHealthReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], PipelineHealthReport);
//# sourceMappingURL=pipeline-health.report.js.map