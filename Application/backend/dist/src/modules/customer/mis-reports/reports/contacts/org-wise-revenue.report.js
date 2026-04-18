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
exports.OrgWiseRevenueReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let OrgWiseRevenueReport = class OrgWiseRevenueReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'ORG_WISE_REVENUE';
        this.name = 'Organization-Wise Revenue';
        this.category = 'CONTACT_ORG';
        this.description = 'Revenue analysis per organization including deal counts, lifetime value, and Pareto distribution';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'industry', label: 'Industry', type: 'text' },
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
        ];
    }
    async generate(params) {
        const baseWhere = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            baseWhere.allocatedToId = params.userId;
        const orgs = await this.prisma.working.organization.findMany({
            where: {
                tenantId: params.tenantId,
                isActive: true,
                ...(params.filters?.industry ? { industry: params.filters.industry } : {}),
            },
            select: { id: true, name: true },
        });
        const orgStats = [];
        for (const org of orgs) {
            const periodLeads = await this.prisma.working.lead.findMany({
                where: { ...baseWhere, organizationId: org.id },
                select: { status: true, expectedValue: true },
            });
            const wonPeriod = periodLeads.filter(l => l.status === 'WON');
            const revenue = wonPeriod.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
            const lifetimeWon = await this.prisma.working.lead.findMany({
                where: { tenantId: params.tenantId, organizationId: org.id, status: 'WON' },
                select: { expectedValue: true },
            });
            const lifetime = lifetimeWon.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
            if (periodLeads.length > 0) {
                orgStats.push({
                    orgId: org.id,
                    orgName: org.name,
                    leads: periodLeads.length,
                    won: wonPeriod.length,
                    revenue,
                    lifetime,
                    avgDealSize: wonPeriod.length > 0 ? Math.round(revenue / wonPeriod.length) : 0,
                });
            }
        }
        orgStats.sort((a, b) => b.revenue - a.revenue);
        const totalOrgs = orgStats.length;
        const totalRevenue = orgStats.reduce((s, o) => s + o.revenue, 0);
        const topOrgRevenue = orgStats.length > 0 ? orgStats[0].revenue : 0;
        const avgOrgRevenue = totalOrgs > 0 ? Math.round(totalRevenue / totalOrgs) : 0;
        let runningRevenue = 0;
        let paretoCount = 0;
        for (const o of orgStats) {
            runningRevenue += o.revenue;
            paretoCount++;
            if (runningRevenue >= totalRevenue * 0.8)
                break;
        }
        const paretoPercent = totalOrgs > 0
            ? Math.round((paretoCount / totalOrgs) * 10000) / 100
            : 0;
        const summary = [
            { key: 'totalOrgs', label: 'Total Organizations', value: totalOrgs, format: 'number' },
            { key: 'topOrgRevenue', label: 'Top Org Revenue', value: topOrgRevenue, format: 'currency' },
            { key: 'avgOrgRevenue', label: 'Avg Org Revenue', value: avgOrgRevenue, format: 'currency' },
            { key: 'paretoPercent', label: 'Pareto % (80% Revenue)', value: paretoPercent, format: 'percent' },
        ];
        const top20 = orgStats.slice(0, 20);
        const charts = [
            {
                type: 'BAR', title: 'Top 20 Organizations by Revenue',
                labels: top20.map(o => o.orgName),
                datasets: [{ label: 'Revenue', data: top20.map(o => o.revenue), color: '#4CAF50' }],
            },
        ];
        const tableColumns = [
            { key: 'orgName', header: 'Organization', width: 25 },
            { key: 'leads', header: 'Leads', width: 10, format: 'number' },
            { key: 'won', header: 'Won', width: 10, format: 'number' },
            { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
            { key: 'lifetime', header: 'Lifetime Value', width: 16, format: 'currency' },
            { key: 'avgDealSize', header: 'Avg Deal Size', width: 16, format: 'currency' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Organization Revenue Breakdown', columns: tableColumns, rows: orgStats }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'org')
            where.organizationId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.OrgWiseRevenueReport = OrgWiseRevenueReport;
exports.OrgWiseRevenueReport = OrgWiseRevenueReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], OrgWiseRevenueReport);
//# sourceMappingURL=org-wise-revenue.report.js.map