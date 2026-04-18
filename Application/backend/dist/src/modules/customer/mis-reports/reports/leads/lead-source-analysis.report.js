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
exports.LeadSourceAnalysisReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const cross_db_resolver_service_1 = require("../../../../../core/prisma/cross-db-resolver.service");
let LeadSourceAnalysisReport = class LeadSourceAnalysisReport {
    constructor(prisma, drillDownService, resolver) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.resolver = resolver;
        this.code = 'LEAD_SOURCE_ANALYSIS';
        this.name = 'Lead Source Analysis';
        this.category = 'LEAD';
        this.description = 'Analyses lead generation effectiveness across different sources with conversion and revenue metrics';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'status', label: 'Status', type: 'multi_select', options: [
                    { value: 'WON', label: 'Won' }, { value: 'LOST', label: 'Lost' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                ] },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
        ];
    }
    async generate(params) {
        const where = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
        if (params.userId)
            where.allocatedToId = params.userId;
        const rawLeads = await this.prisma.working.lead.findMany({
            where,
            select: {
                status: true, expectedValue: true, createdAt: true, updatedAt: true,
                filters: true,
            },
        });
        const allFilters = rawLeads.flatMap(l => l.filters || []);
        const enrichedFilters = await this.resolver.resolveLookupValues(allFilters, 'lookupValueId', true);
        let filterIdx = 0;
        const leads = rawLeads.map(lead => {
            const count = (lead.filters || []).length;
            const resolved = enrichedFilters.slice(filterIdx, filterIdx + count);
            filterIdx += count;
            return { ...lead, filters: resolved };
        });
        const sources = new Map();
        for (const lead of leads) {
            const srcFilter = lead.filters.find(f => f.lookupValue?.lookup?.category === 'LEAD_SOURCE');
            const label = srcFilter?.lookupValue?.label || 'Unknown';
            if (!sources.has(label))
                sources.set(label, { total: 0, won: 0, revenue: 0, closeDays: [], label });
            const bucket = sources.get(label);
            bucket.total++;
            if (lead.status === 'WON') {
                bucket.won++;
                bucket.revenue += Number(lead.expectedValue || 0);
                const days = Math.ceil((lead.updatedAt.getTime() - lead.createdAt.getTime()) / 86400000);
                bucket.closeDays.push(days);
            }
        }
        const sourceList = Array.from(sources.values()).sort((a, b) => b.total - a.total);
        const totalSources = sourceList.length;
        const rateOf = (s) => s.total > 0 ? Math.round((s.won / s.total) * 10000) / 100 : 0;
        const qualityRating = (conv) => conv > 30 ? 'Excellent' : conv > 20 ? 'Good' : conv > 10 ? 'Average' : 'Poor';
        const best = sourceList.reduce((a, b) => rateOf(a) > rateOf(b) ? a : b, sourceList[0]);
        const worst = sourceList.reduce((a, b) => rateOf(a) < rateOf(b) ? a : b, sourceList[0]);
        const avgConversion = totalSources > 0
            ? Math.round(sourceList.reduce((s, b) => s + rateOf(b), 0) / totalSources * 100) / 100
            : 0;
        const summary = [
            { key: 'totalSources', label: 'Total Sources', value: totalSources, format: 'number' },
            { key: 'bestSource', label: 'Best Source', value: rateOf(best || { total: 0, won: 0 }), format: 'percent' },
            { key: 'worstSource', label: 'Worst Source', value: rateOf(worst || { total: 0, won: 0 }), format: 'percent' },
            { key: 'avgConversion', label: 'Avg Conversion Across Sources', value: avgConversion, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Leads by Source',
                labels: sourceList.map(s => s.label),
                datasets: [{ label: 'Leads', data: sourceList.map(s => s.total) }],
            },
            {
                type: 'DONUT', title: 'Revenue by Source',
                labels: sourceList.map(s => s.label),
                datasets: [{ label: 'Revenue', data: sourceList.map(s => s.revenue) }],
            },
        ];
        const avgClose = (days) => days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
        const tableRows = sourceList.map(s => ({
            source: s.label, totalLeads: s.total, wonLeads: s.won,
            conversionRate: rateOf(s), totalRevenue: s.revenue,
            avgCloseTime: avgClose(s.closeDays), qualityRating: qualityRating(rateOf(s)),
        }));
        const columns = [
            { key: 'source', header: 'Source', width: 20 },
            { key: 'totalLeads', header: 'Total Leads', width: 12, format: 'number' },
            { key: 'wonLeads', header: 'Won', width: 10, format: 'number' },
            { key: 'conversionRate', header: 'Conversion %', width: 14, format: 'percent' },
            { key: 'totalRevenue', header: 'Revenue', width: 18, format: 'currency' },
            { key: 'avgCloseTime', header: 'Avg Close (days)', width: 16, format: 'number' },
            { key: 'qualityRating', header: 'Quality', width: 12 },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Source Breakdown', columns, rows: tableRows }],
            metadata: { bestSource: best?.label, worstSource: worst?.label },
        };
    }
    async drillDown(params) {
        const leads = await this.prisma.working.lead.findMany({
            where: {
                tenantId: params.filters?.tenantId,
                createdAt: { gte: params.dateFrom, lte: params.dateTo },
                filters: { some: { lookupValue: { label: params.value, lookup: { category: 'LEAD_SOURCE' } } } },
            },
            select: { id: true },
        });
        const where = { tenantId: params.filters?.tenantId, id: { in: leads.map(l => l.id) } };
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.LeadSourceAnalysisReport = LeadSourceAnalysisReport;
exports.LeadSourceAnalysisReport = LeadSourceAnalysisReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService,
        cross_db_resolver_service_1.CrossDbResolverService])
], LeadSourceAnalysisReport);
//# sourceMappingURL=lead-source-analysis.report.js.map