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
exports.CustomerConcentrationReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let CustomerConcentrationReport = class CustomerConcentrationReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CUSTOMER_CONCENTRATION';
        this.name = 'Customer Concentration';
        this.category = 'EXECUTIVE';
        this.description = 'Pareto analysis of revenue by organization showing concentration risk and cumulative revenue distribution';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'industry', label: 'Industry', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            status: 'WON',
            updatedAt: { gte: params.dateFrom, lte: params.dateTo },
            organizationId: { not: null },
        };
        const wonLeads = await this.prisma.working.lead.findMany({
            where,
            select: {
                id: true, expectedValue: true,
                organization: { select: { id: true, name: true, industry: true } },
            },
        });
        const filtered = params.filters?.industry
            ? wonLeads.filter(l => l.organization?.industry === params.filters.industry)
            : wonLeads;
        const orgMap = new Map();
        filtered.forEach(l => {
            const orgId = l.organization?.id;
            if (!orgId)
                return;
            if (!orgMap.has(orgId)) {
                orgMap.set(orgId, {
                    name: l.organization.name, industry: l.organization.industry || 'N/A',
                    revenue: 0, dealCount: 0,
                });
            }
            const entry = orgMap.get(orgId);
            entry.revenue += Number(l.expectedValue || 0);
            entry.dealCount++;
        });
        const ranked = [...orgMap.entries()].map(([orgId, d]) => ({
            orgId, name: d.name, industry: d.industry, revenue: d.revenue, dealCount: d.dealCount,
        })).sort((a, b) => b.revenue - a.revenue);
        const totalRevenue = ranked.reduce((s, r) => s + r.revenue, 0);
        const totalOrgs = ranked.length;
        let cumulative = 0;
        const paretoRows = ranked.map((r, idx) => {
            cumulative += r.revenue;
            const percent = totalRevenue > 0 ? Math.round((r.revenue / totalRevenue) * 10000) / 100 : 0;
            const cumulativePercent = totalRevenue > 0 ? Math.round((cumulative / totalRevenue) * 10000) / 100 : 0;
            return { rank: idx + 1, ...r, percent, cumulativePercent };
        });
        const top10Pct = Math.ceil(totalOrgs * 0.1);
        const top20Pct = Math.ceil(totalOrgs * 0.2);
        const top10Revenue = ranked.slice(0, top10Pct).reduce((s, r) => s + r.revenue, 0);
        const top20Revenue = ranked.slice(0, top20Pct).reduce((s, r) => s + r.revenue, 0);
        const top10PercentRevenueShare = totalRevenue > 0
            ? Math.round((top10Revenue / totalRevenue) * 10000) / 100
            : 0;
        const top20PercentRevenueShare = totalRevenue > 0
            ? Math.round((top20Revenue / totalRevenue) * 10000) / 100
            : 0;
        let riskLevel;
        if (top20PercentRevenueShare > 70)
            riskLevel = 'HIGH';
        else if (top20PercentRevenueShare > 50)
            riskLevel = 'MEDIUM';
        else
            riskLevel = 'LOW';
        const summary = [
            { key: 'totalOrgs', label: 'Total Organizations', value: totalOrgs, format: 'number' },
            { key: 'top10PercentRevenueShare', label: 'Top 10% Revenue Share', value: top10PercentRevenueShare, format: 'percent' },
            { key: 'top20PercentRevenueShare', label: 'Top 20% Revenue Share', value: top20PercentRevenueShare, format: 'percent' },
            { key: 'riskScore', label: 'Concentration Risk Score', value: top20PercentRevenueShare, format: 'percent' },
        ];
        const topN = paretoRows.slice(0, 20);
        const charts = [
            {
                type: 'BAR', title: 'Top 20 Organizations by Revenue',
                labels: topN.map(r => r.name),
                datasets: [{ label: 'Revenue', data: topN.map(r => r.revenue), color: '#FF9800' }],
            },
            {
                type: 'LINE', title: 'Pareto Cumulative Curve',
                labels: paretoRows.map(r => r.name),
                datasets: [{ label: 'Cumulative %', data: paretoRows.map(r => r.cumulativePercent), color: '#E91E63' }],
            },
        ];
        const tableCols = [
            { key: 'rank', header: 'Rank', width: 8, format: 'number' },
            { key: 'name', header: 'Organization', width: 25 },
            { key: 'industry', header: 'Industry', width: 16 },
            { key: 'dealCount', header: 'Deals', width: 10, format: 'number' },
            { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
            { key: 'percent', header: '% of Total', width: 12, format: 'percent' },
            { key: 'cumulativePercent', header: 'Cumulative %', width: 14, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Organization Revenue Ranking', columns: tableCols, rows: paretoRows }],
            metadata: { riskLevel, totalRevenue },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            status: 'WON',
            updatedAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'organization')
            where.organizationId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.CustomerConcentrationReport = CustomerConcentrationReport;
exports.CustomerConcentrationReport = CustomerConcentrationReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], CustomerConcentrationReport);
//# sourceMappingURL=customer-concentration.report.js.map