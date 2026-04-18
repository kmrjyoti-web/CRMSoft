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
exports.SalesForecastReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const STAGE_PROBABILITIES = {
    NEW: 10, VERIFIED: 20, ALLOCATED: 30, IN_PROGRESS: 40,
    DEMO_SCHEDULED: 50, QUOTATION_SENT: 70, NEGOTIATION: 85,
};
const PIPELINE_STATUSES = Object.keys(STAGE_PROBABILITIES);
let SalesForecastReport = class SalesForecastReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'SALES_FORECAST';
        this.name = 'Sales Forecast';
        this.category = 'SALES';
        this.description = 'Pipeline-weighted revenue forecast with optimistic, realistic, and pessimistic scenarios';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
            { key: 'priority', label: 'Priority', type: 'select', options: [
                    { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
                ] },
            { key: 'minValue', label: 'Min Expected Value', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            status: { in: PIPELINE_STATUSES },
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        if (params.filters?.priority)
            where.priority = params.filters.priority;
        const leads = await this.prisma.working.lead.findMany({
            where,
            include: {
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
            },
            orderBy: { expectedValue: 'desc' },
        });
        let realisticTotal = 0;
        const stageValueMap = new Map();
        const enriched = leads.map(l => {
            const value = Number(l.expectedValue || 0);
            const probability = STAGE_PROBABILITIES[l.status] || 0;
            const weightedValue = Math.round(value * probability / 100);
            realisticTotal += weightedValue;
            const entry = stageValueMap.get(l.status) || { total: 0, weighted: 0, count: 0 };
            entry.total += value;
            entry.weighted += weightedValue;
            entry.count++;
            stageValueMap.set(l.status, entry);
            return {
                id: l.id,
                leadNumber: l.leadNumber,
                contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
                organization: l.organization?.name || '',
                status: l.status,
                value,
                probability,
                weightedValue,
                expectedCloseDate: l.expectedCloseDate,
            };
        });
        const optimisticTotal = Math.round(realisticTotal * 1.3);
        const pessimisticTotal = Math.round(realisticTotal * 0.7);
        const summary = [
            { key: 'realisticForecast', label: 'Realistic Forecast', value: realisticTotal, format: 'currency' },
            { key: 'optimisticForecast', label: 'Optimistic Forecast', value: optimisticTotal, format: 'currency' },
            { key: 'pessimisticForecast', label: 'Pessimistic Forecast', value: pessimisticTotal, format: 'currency' },
            { key: 'pipelineCount', label: 'Pipeline Deals', value: leads.length, format: 'number' },
        ];
        const orderedStages = PIPELINE_STATUSES.filter(s => stageValueMap.has(s));
        const stageChart = {
            type: 'BAR', title: 'Pipeline Value by Stage',
            labels: orderedStages,
            datasets: [
                { label: 'Total Value', data: orderedStages.map(s => stageValueMap.get(s).total), color: '#90CAF9' },
                { label: 'Weighted Value', data: orderedStages.map(s => stageValueMap.get(s).weighted), color: '#4CAF50' },
            ],
        };
        const topDeals = enriched
            .sort((a, b) => b.weightedValue - a.weightedValue)
            .slice(0, 20);
        const tableCols = [
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'contact', header: 'Contact', width: 20 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'status', header: 'Stage', width: 16 },
            { key: 'value', header: 'Value', width: 14, format: 'currency' },
            { key: 'probability', header: 'Prob %', width: 10, format: 'percent' },
            { key: 'weightedValue', header: 'Weighted', width: 14, format: 'currency' },
            { key: 'expectedCloseDate', header: 'Exp. Close', width: 14, format: 'date' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [stageChart],
            tables: [{ title: 'Top 20 Pipeline Deals', columns: tableCols, rows: topDeals }],
            metadata: { stageProbabilities: STAGE_PROBABILITIES },
        };
    }
};
exports.SalesForecastReport = SalesForecastReport;
exports.SalesForecastReport = SalesForecastReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], SalesForecastReport);
//# sourceMappingURL=sales-forecast.report.js.map