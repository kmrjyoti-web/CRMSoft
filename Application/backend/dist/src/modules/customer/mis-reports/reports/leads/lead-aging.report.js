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
exports.LeadAgingReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
const BUCKETS = [
    { label: '0-7 days', min: 0, max: 7 },
    { label: '8-14 days', min: 8, max: 14 },
    { label: '15-30 days', min: 15, max: 30 },
    { label: '31-60 days', min: 31, max: 60 },
    { label: '60+ days', min: 61, max: Infinity },
];
let LeadAgingReport = class LeadAgingReport {
    constructor(prisma, drillDownService) {
        this.prisma = prisma;
        this.drillDownService = drillDownService;
        this.code = 'LEAD_AGING';
        this.name = 'Lead Aging Report';
        this.category = 'LEAD';
        this.description = 'Analyses active leads by age buckets to identify stale or ageing pipeline items';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'status', label: 'Status', type: 'multi_select' },
            { key: 'allocatedTo', label: 'Allocated To', type: 'user' },
            { key: 'priority', label: 'Priority', type: 'select', options: [
                    { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
                ] },
        ];
    }
    async generate(params) {
        const now = new Date();
        const where = {
            tenantId: params.tenantId,
            status: { notIn: ['WON', 'LOST'] },
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
            orderBy: { createdAt: 'asc' },
        });
        const bucketCounts = BUCKETS.map(() => 0);
        const ageDays = [];
        for (const lead of leads) {
            const age = Math.floor((now.getTime() - lead.createdAt.getTime()) / 86400000);
            ageDays.push(age);
            const idx = BUCKETS.findIndex(b => age >= b.min && age <= b.max);
            if (idx >= 0)
                bucketCounts[idx]++;
        }
        const totalActive = leads.length;
        const avgAge = totalActive > 0 ? Math.round(ageDays.reduce((a, b) => a + b, 0) / totalActive) : 0;
        const stalestAge = ageDays.length > 0 ? Math.max(...ageDays) : 0;
        const staleOver30 = ageDays.filter(d => d > 30).length;
        const stalePct = totalActive > 0 ? Math.round((staleOver30 / totalActive) * 10000) / 100 : 0;
        const summary = [
            { key: 'totalActive', label: 'Total Active Leads', value: totalActive, format: 'number' },
            { key: 'avgAge', label: 'Average Age', value: avgAge, format: 'days' },
            { key: 'stalestAge', label: 'Stalest Lead Age', value: stalestAge, format: 'days' },
            { key: 'stalePctOverThirtyDays', label: 'Stale (>30 days) %', value: stalePct, format: 'percent' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Leads by Age Bucket',
                labels: BUCKETS.map(b => b.label),
                datasets: [{ label: 'Leads', data: bucketCounts }],
            },
        ];
        const stalest = leads
            .map(l => ({
            leadNumber: l.leadNumber,
            contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
            organization: l.organization?.name || '',
            status: l.status,
            age: Math.floor((now.getTime() - l.createdAt.getTime()) / 86400000),
            value: Number(l.expectedValue || 0),
        }))
            .sort((a, b) => b.age - a.age)
            .slice(0, 20);
        const columns = [
            { key: 'leadNumber', header: 'Lead #', width: 18 },
            { key: 'contact', header: 'Contact', width: 22 },
            { key: 'organization', header: 'Organization', width: 25 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'age', header: 'Age (days)', width: 12, format: 'number' },
            { key: 'value', header: 'Value', width: 18, format: 'currency' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Top 20 Stalest Leads', columns, rows: stalest }],
        };
    }
    async drillDown(params) {
        const bucket = BUCKETS.find(b => b.label === params.value);
        const now = new Date();
        const minDate = bucket ? new Date(now.getTime() - bucket.max * 86400000) : undefined;
        const maxDate = bucket ? new Date(now.getTime() - bucket.min * 86400000) : undefined;
        const where = {
            tenantId: params.filters?.tenantId,
            status: { notIn: ['WON', 'LOST'] },
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (minDate && maxDate) {
            where.createdAt = { gte: minDate, lte: maxDate };
        }
        const result = await this.drillDownService.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.LeadAgingReport = LeadAgingReport;
exports.LeadAgingReport = LeadAgingReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], LeadAgingReport);
//# sourceMappingURL=lead-aging.report.js.map