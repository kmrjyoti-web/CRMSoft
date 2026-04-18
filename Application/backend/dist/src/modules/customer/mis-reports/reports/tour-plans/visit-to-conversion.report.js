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
exports.VisitToConversionReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let VisitToConversionReport = class VisitToConversionReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'VISIT_TO_CONVERSION';
        this.name = 'Visit to Conversion';
        this.category = 'TOUR_PLAN';
        this.description = 'Measures field visit effectiveness by tracking conversion from visit to demo, quotation, and won stages';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'salesPersonId', label: 'Sales Person', type: 'user' },
        ];
    }
    async generate(params) {
        const dateFilter = { gte: params.dateFrom, lte: params.dateTo };
        const tenantId = params.tenantId;
        const visitWhere = { tenantId, createdAt: dateFilter };
        if (params.userId)
            visitWhere.tourPlan = { salesPersonId: params.userId };
        const visits = await this.prisma.working.tourPlanVisit.findMany({
            where: visitWhere,
            select: {
                id: true, leadId: true,
                tourPlan: { select: { salesPerson: { select: { id: true, firstName: true, lastName: true } } } },
                lead: {
                    select: {
                        id: true, status: true,
                        demos: { select: { id: true } },
                        quotations: { select: { id: true } },
                    },
                },
            },
        });
        const fieldLeadIds = new Set();
        visits.forEach(v => { if (v.leadId)
            fieldLeadIds.add(v.leadId); });
        const fieldLeads = visits
            .filter(v => v.lead)
            .reduce((map, v) => { map.set(v.lead.id, v.lead); return map; }, new Map());
        const totalFieldVisits = visits.length;
        const withDemo = [...fieldLeads.values()].filter(l => l.demos.length > 0).length;
        const withQuotation = [...fieldLeads.values()].filter(l => l.quotations.length > 0).length;
        const withWon = [...fieldLeads.values()].filter(l => l.status === 'WON').length;
        const fieldLeadCount = fieldLeads.size;
        const visitToDemoRate = fieldLeadCount > 0 ? Math.round((withDemo / fieldLeadCount) * 10000) / 100 : 0;
        const visitToQuotationRate = fieldLeadCount > 0 ? Math.round((withQuotation / fieldLeadCount) * 10000) / 100 : 0;
        const visitToWonRate = fieldLeadCount > 0 ? Math.round((withWon / fieldLeadCount) * 10000) / 100 : 0;
        const nonFieldLeads = await this.prisma.working.lead.findMany({
            where: {
                tenantId, createdAt: dateFilter,
                id: { notIn: [...fieldLeadIds] },
            },
            select: {
                id: true, status: true,
                demos: { select: { id: true } },
                quotations: { select: { id: true } },
            },
        });
        const nonFieldTotal = nonFieldLeads.length;
        const nonFieldWon = nonFieldLeads.filter(l => l.status === 'WON').length;
        const fieldConversion = fieldLeadCount > 0 ? Math.round((withWon / fieldLeadCount) * 10000) / 100 : 0;
        const nonFieldConversion = nonFieldTotal > 0 ? Math.round((nonFieldWon / nonFieldTotal) * 10000) / 100 : 0;
        const summary = [
            { key: 'totalFieldVisits', label: 'Total Field Visits', value: totalFieldVisits, format: 'number' },
            { key: 'visitToDemoRate', label: 'Visit to Demo Rate', value: visitToDemoRate, format: 'percent' },
            { key: 'visitToQuotationRate', label: 'Visit to Quotation Rate', value: visitToQuotationRate, format: 'percent' },
            { key: 'visitToWonRate', label: 'Visit to Won Rate', value: visitToWonRate, format: 'percent' },
            { key: 'fieldLeadConversion', label: 'Field Lead Conversion', value: fieldConversion, format: 'percent' },
            { key: 'nonFieldLeadConversion', label: 'Non-Field Lead Conversion', value: nonFieldConversion, format: 'percent' },
        ];
        const charts = [
            {
                type: 'FUNNEL', title: 'Field Visit Conversion Funnel',
                labels: ['Visits', 'Demo', 'Quotation', 'Won'],
                datasets: [{
                        label: 'Count',
                        data: [totalFieldVisits, withDemo, withQuotation, withWon],
                        color: '#009688',
                    }],
            },
            {
                type: 'BAR', title: 'Field vs Non-Field Lead Conversion',
                labels: ['Field Leads', 'Non-Field Leads'],
                datasets: [{ label: 'Conversion %', data: [fieldConversion, nonFieldConversion], color: '#FF5722' }],
            },
        ];
        const userMap = new Map();
        visits.forEach(v => {
            const uid = v.tourPlan.salesPerson.id;
            const uName = `${v.tourPlan.salesPerson.firstName} ${v.tourPlan.salesPerson.lastName}`;
            if (!userMap.has(uid)) {
                userMap.set(uid, { name: uName, visits: 0, leadIds: new Set(), leadsMap: new Map() });
            }
            const e = userMap.get(uid);
            e.visits++;
            if (v.lead) {
                e.leadIds.add(v.lead.id);
                e.leadsMap.set(v.lead.id, v.lead);
            }
        });
        const userStats = [...userMap.entries()].map(([userId, d]) => {
            const leads = [...d.leadsMap.values()];
            const demos = leads.filter(l => l.demos.length > 0).length;
            const quotations = leads.filter(l => l.quotations.length > 0).length;
            const won = leads.filter(l => l.status === 'WON').length;
            const uniqueLeads = d.leadIds.size;
            return {
                userId, name: d.name, visits: d.visits, uniqueLeads,
                demos, quotations, won,
                demoRate: uniqueLeads > 0 ? Math.round((demos / uniqueLeads) * 10000) / 100 : 0,
                quotationRate: uniqueLeads > 0 ? Math.round((quotations / uniqueLeads) * 10000) / 100 : 0,
                wonRate: uniqueLeads > 0 ? Math.round((won / uniqueLeads) * 10000) / 100 : 0,
            };
        });
        userStats.sort((a, b) => b.wonRate - a.wonRate);
        const tableColumns = [
            { key: 'name', header: 'Sales Person', width: 20 },
            { key: 'visits', header: 'Visits', width: 10, format: 'number' },
            { key: 'uniqueLeads', header: 'Leads', width: 10, format: 'number' },
            { key: 'demos', header: 'Demos', width: 10, format: 'number' },
            { key: 'quotations', header: 'Quotations', width: 12, format: 'number' },
            { key: 'won', header: 'Won', width: 8, format: 'number' },
            { key: 'demoRate', header: 'Demo %', width: 10, format: 'percent' },
            { key: 'quotationRate', header: 'Quote %', width: 10, format: 'percent' },
            { key: 'wonRate', header: 'Won %', width: 10, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Per User Visit-to-Conversion Metrics', columns: tableColumns, rows: userStats }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
            tourPlanVisits: { some: {} },
        };
        if (params.dimension === 'user')
            where.allocatedToId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.VisitToConversionReport = VisitToConversionReport;
exports.VisitToConversionReport = VisitToConversionReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], VisitToConversionReport);
//# sourceMappingURL=visit-to-conversion.report.js.map