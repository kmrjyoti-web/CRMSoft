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
exports.LeadFunnelReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const cross_db_resolver_service_1 = require("../../../../../core/prisma/cross-db-resolver.service");
const FUNNEL_STAGES = [
    'NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS',
    'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON',
];
let LeadFunnelReport = class LeadFunnelReport {
    constructor(prisma, drillDownService, resolver) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.resolver = resolver;
        this.code = 'LEAD_FUNNEL';
        this.name = 'Lead Funnel Analysis';
        this.category = 'LEAD';
        this.description = 'Visualises the lead pipeline as a funnel with stage counts and drop-off percentages';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'source', label: 'Lead Source', type: 'select' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
            { key: 'groupBy', label: 'Group By', type: 'select', options: [{ value: 'source', label: 'Source' }] },
        ];
    }
    async generate(params) {
        const where = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
        if (params.userId)
            where.allocatedToId = params.userId;
        const rawLeads = await this.prisma.working.lead.findMany({
            where,
            select: {
                status: true,
                expectedValue: true,
                filters: true,
            },
        });
        const allFilters = rawLeads.flatMap(l => l.filters || []);
        const enrichedFilters = await this.resolver.resolveLookupValues(allFilters, 'lookupValueId', true);
        const filtersByLeadIdx = new Map();
        let filterIdx = 0;
        const leads = rawLeads.map((lead, i) => {
            const count = (lead.filters || []).length;
            const resolved = enrichedFilters.slice(filterIdx, filterIdx + count);
            filterIdx += count;
            return { ...lead, filters: resolved };
        });
        const stageMap = new Map();
        FUNNEL_STAGES.forEach(s => stageMap.set(s, { count: 0, value: 0 }));
        for (const lead of leads) {
            const entry = stageMap.get(lead.status);
            if (entry) {
                entry.count++;
                entry.value += Number(lead.expectedValue || 0);
            }
        }
        const stages = FUNNEL_STAGES.map(s => ({ stage: s, ...stageMap.get(s) }));
        const totalLeads = leads.length;
        const wonCount = stageMap.get('WON').count;
        const overallConversion = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 10000) / 100 : 0;
        let biggestLeakStage = 'N/A';
        let maxDrop = 0;
        const tableRows = [];
        for (let i = 0; i < stages.length; i++) {
            const prev = i > 0 ? stages[i - 1].count : stages[i].count;
            const dropOff = prev > 0 ? Math.round(((prev - stages[i].count) / prev) * 10000) / 100 : 0;
            if (i > 0 && prev - stages[i].count > maxDrop) {
                maxDrop = prev - stages[i].count;
                biggestLeakStage = stages[i].stage;
            }
            tableRows.push({
                stage: stages[i].stage, count: stages[i].count,
                value: stages[i].value, dropOffPercent: i === 0 ? 0 : dropOff,
            });
        }
        const funnelHealth = overallConversion >= 15 ? 'Healthy' : overallConversion >= 5 ? 'Average' : 'Poor';
        const summary = [
            { key: 'totalLeads', label: 'Total Leads', value: totalLeads, format: 'number' },
            { key: 'biggestLeakStage', label: 'Biggest Leak Stage', value: maxDrop, format: 'number' },
            { key: 'overallConversion', label: 'Overall Conversion (NEW to WON)', value: overallConversion, format: 'percent' },
            { key: 'funnelHealth', label: 'Funnel Health', value: overallConversion, format: 'percent' },
        ];
        const charts = [
            {
                type: 'FUNNEL', title: 'Lead Funnel',
                labels: stages.map(s => s.stage),
                datasets: [{ label: 'Leads', data: stages.map(s => s.count) }],
            },
        ];
        if (params.groupBy === 'source') {
            const sourceMap = new Map();
            for (const lead of leads) {
                const src = lead.filters.find(f => f.lookupValue?.lookup?.category === 'LEAD_SOURCE');
                const srcLabel = src?.lookupValue?.label || 'Unknown';
                if (!sourceMap.has(srcLabel))
                    sourceMap.set(srcLabel, new Array(FUNNEL_STAGES.length).fill(0));
                const idx = FUNNEL_STAGES.indexOf(lead.status);
                if (idx >= 0)
                    sourceMap.get(srcLabel)[idx]++;
            }
            charts.push({
                type: 'STACKED_BAR', title: 'Funnel by Source',
                labels: [...FUNNEL_STAGES],
                datasets: Array.from(sourceMap.entries()).map(([label, data]) => ({ label, data })),
            });
        }
        const columns = [
            { key: 'stage', header: 'Stage', width: 20 },
            { key: 'count', header: 'Count', width: 10, format: 'number' },
            { key: 'value', header: 'Value', width: 18, format: 'currency' },
            { key: 'dropOffPercent', header: 'Drop-off %', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Funnel Stages', columns, rows: tableRows }],
            metadata: { funnelHealth, biggestLeakStage },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            status: params.value,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.LeadFunnelReport = LeadFunnelReport;
exports.LeadFunnelReport = LeadFunnelReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService,
        cross_db_resolver_service_1.CrossDbResolverService])
], LeadFunnelReport);
//# sourceMappingURL=lead-funnel.report.js.map