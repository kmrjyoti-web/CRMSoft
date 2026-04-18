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
exports.GeographicDistributionReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let GeographicDistributionReport = class GeographicDistributionReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'GEOGRAPHIC_DISTRIBUTION';
        this.name = 'Geographic Distribution';
        this.category = 'CONTACT_ORG';
        this.description = 'Analyzes organization and lead distribution by state and city with revenue breakdown';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'state', label: 'State', type: 'text' },
            { key: 'city', label: 'City', type: 'text' },
        ];
    }
    async generate(params) {
        const orgs = await this.prisma.working.organization.findMany({
            where: {
                tenantId: params.tenantId,
                isActive: true,
                ...(params.filters?.state ? { state: params.filters.state } : {}),
                ...(params.filters?.city ? { city: params.filters.city } : {}),
            },
            select: { id: true, state: true, city: true },
        });
        const orgIds = orgs.map(o => o.id);
        const leads = await this.prisma.working.lead.findMany({
            where: {
                tenantId: params.tenantId,
                createdAt: { gte: params.dateFrom, lte: params.dateTo },
                organizationId: { in: orgIds },
            },
            select: { organizationId: true, status: true, expectedValue: true },
        });
        const orgLocationMap = new Map();
        orgs.forEach(o => orgLocationMap.set(o.id, {
            state: o.state || 'Unknown',
            city: o.city || 'Unknown',
        }));
        const stateMap = new Map();
        const cityMap = new Map();
        orgs.forEach(o => {
            const state = o.state || 'Unknown';
            const city = o.city || 'Unknown';
            if (!stateMap.has(state))
                stateMap.set(state, { orgCount: 0, leadCount: 0, revenue: 0 });
            stateMap.get(state).orgCount++;
            const cityKey = `${state}|${city}`;
            if (!cityMap.has(cityKey))
                cityMap.set(cityKey, { state, orgCount: 0, leadCount: 0, revenue: 0 });
            cityMap.get(cityKey).orgCount++;
        });
        leads.forEach(l => {
            const loc = orgLocationMap.get(l.organizationId);
            if (!loc)
                return;
            const revenue = l.status === 'WON' ? Number(l.expectedValue || 0) : 0;
            if (stateMap.has(loc.state)) {
                stateMap.get(loc.state).leadCount++;
                stateMap.get(loc.state).revenue += revenue;
            }
            const cityKey = `${loc.state}|${loc.city}`;
            if (cityMap.has(cityKey)) {
                cityMap.get(cityKey).leadCount++;
                cityMap.get(cityKey).revenue += revenue;
            }
        });
        const states = [...stateMap.entries()]
            .map(([state, data]) => ({ state, ...data }))
            .sort((a, b) => b.orgCount - a.orgCount);
        const cities = [...cityMap.entries()]
            .map(([key, data]) => ({ city: key.split('|')[1], ...data }))
            .sort((a, b) => b.orgCount - a.orgCount);
        const totalStates = states.filter(s => s.state !== 'Unknown').length;
        const totalCities = cities.filter(c => c.city !== 'Unknown').length;
        const topCity = cities.length > 0 ? cities[0].city : 'N/A';
        const topState = states.length > 0 ? states[0].state : 'N/A';
        const summary = [
            { key: 'totalStates', label: 'Total States', value: totalStates, format: 'number' },
            { key: 'totalCities', label: 'Total Cities', value: totalCities, format: 'number' },
            { key: 'topCity', label: 'Top City (Org Count)', value: cities[0]?.orgCount || 0, format: 'number' },
            { key: 'topState', label: 'Top State (Org Count)', value: states[0]?.orgCount || 0, format: 'number' },
        ];
        const top10Cities = cities.slice(0, 10);
        const charts = [
            {
                type: 'BAR', title: 'Top 10 Cities by Organization Count',
                labels: top10Cities.map(c => c.city),
                datasets: [{ label: 'Organizations', data: top10Cities.map(c => c.orgCount), color: '#3F51B5' }],
            },
        ];
        const tableColumns = [
            { key: 'state', header: 'State', width: 18 },
            { key: 'city', header: 'City', width: 18 },
            { key: 'orgCount', header: 'Organizations', width: 14, format: 'number' },
            { key: 'leadCount', header: 'Leads', width: 10, format: 'number' },
            { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Geographic Breakdown', columns: tableColumns, rows: cities }],
            metadata: { topCity, topState },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'city') {
            where.organization = { city: params.value };
        }
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.GeographicDistributionReport = GeographicDistributionReport;
exports.GeographicDistributionReport = GeographicDistributionReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], GeographicDistributionReport);
//# sourceMappingURL=geographic-distribution.report.js.map