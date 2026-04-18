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
exports.FieldTeamTrackerReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let FieldTeamTrackerReport = class FieldTeamTrackerReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'FIELD_TEAM_TRACKER';
        this.name = 'Field Team Tracker';
        this.category = 'TOUR_PLAN';
        this.description = 'Tracks field team activity including visits per user, organizations covered, and geographic reach';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'salesPersonId', label: 'Sales Person', type: 'user' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.tourPlan = { salesPersonId: params.userId };
        const visits = await this.prisma.working.tourPlanVisit.findMany({
            where,
            select: {
                id: true, createdAt: true,
                tourPlan: {
                    select: {
                        planDate: true,
                        salesPerson: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
                lead: {
                    select: {
                        organization: { select: { id: true, name: true, city: true } },
                    },
                },
            },
        });
        const dayCount = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        const userMap = new Map();
        const cityCounter = new Map();
        visits.forEach(v => {
            const uid = v.tourPlan.salesPerson.id;
            const uName = `${v.tourPlan.salesPerson.firstName} ${v.tourPlan.salesPerson.lastName}`;
            if (!userMap.has(uid)) {
                userMap.set(uid, { name: uName, visitCount: 0, orgIds: new Set(), cities: new Set(), dates: new Set() });
            }
            const e = userMap.get(uid);
            e.visitCount++;
            e.dates.add(v.tourPlan.planDate.toISOString().slice(0, 10));
            const org = v.lead?.organization;
            if (org) {
                e.orgIds.add(org.id);
                if (org.city) {
                    e.cities.add(org.city);
                    cityCounter.set(org.city, (cityCounter.get(org.city) || 0) + 1);
                }
            }
        });
        const userStats = [...userMap.entries()].map(([userId, d]) => ({
            userId, name: d.name, visits: d.visitCount,
            uniqueOrgs: d.orgIds.size,
            cities: d.cities.size,
            cityList: [...d.cities].join(', '),
            avgPerDay: d.dates.size > 0 ? Math.round((d.visitCount / d.dates.size) * 100) / 100 : 0,
        }));
        userStats.sort((a, b) => b.visits - a.visits);
        const topCities = [...cityCounter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const totalVisits = visits.length;
        const totalReps = userMap.size;
        const avgPerRep = totalReps > 0 ? Math.round((totalVisits / totalReps) * 100) / 100 : 0;
        const summary = [
            { key: 'totalFieldReps', label: 'Total Field Reps', value: totalReps, format: 'number' },
            { key: 'totalVisits', label: 'Total Visits', value: totalVisits, format: 'number' },
            { key: 'avgVisitsPerRep', label: 'Avg Visits/Rep', value: avgPerRep, format: 'number' },
            { key: 'topCitiesCovered', label: 'Cities Covered', value: cityCounter.size, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Visits per User',
                labels: userStats.map(u => u.name),
                datasets: [{ label: 'Visits', data: userStats.map(u => u.visits), color: '#3F51B5' }],
            },
            {
                type: 'BAR', title: 'Top 10 Cities by Visit Count',
                labels: topCities.map(c => c[0]),
                datasets: [{ label: 'Visits', data: topCities.map(c => c[1]), color: '#E91E63' }],
            },
        ];
        const tableColumns = [
            { key: 'name', header: 'Sales Person', width: 22 },
            { key: 'visits', header: 'Total Visits', width: 12, format: 'number' },
            { key: 'uniqueOrgs', header: 'Unique Orgs', width: 12, format: 'number' },
            { key: 'cities', header: 'Cities', width: 10, format: 'number' },
            { key: 'cityList', header: 'City Names', width: 30 },
            { key: 'avgPerDay', header: 'Avg/Day', width: 10, format: 'number' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Field Team Activity Breakdown', columns: tableColumns, rows: userStats }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user') {
            where.tourPlan = { salesPersonId: params.value };
        }
        const skip = (params.page - 1) * params.limit;
        const [records, total] = await Promise.all([
            this.prisma.working.tourPlanVisit.findMany({
                where,
                include: {
                    tourPlan: { select: { planDate: true, salesPerson: { select: { firstName: true, lastName: true } } } },
                    lead: { select: { leadNumber: true, organization: { select: { name: true, city: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: params.limit,
            }),
            this.prisma.working.tourPlanVisit.count({ where }),
        ]);
        const columns = [
            { key: 'planDate', header: 'Plan Date', width: 14, format: 'date' },
            { key: 'salesPerson', header: 'Sales Person', width: 20 },
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'city', header: 'City', width: 14 },
            { key: 'outcome', header: 'Outcome', width: 18 },
        ];
        const rows = records.map(r => ({
            planDate: r.tourPlan.planDate,
            salesPerson: `${r.tourPlan.salesPerson.firstName} ${r.tourPlan.salesPerson.lastName}`,
            leadNumber: r.lead?.leadNumber || '',
            organization: r.lead?.organization?.name || '',
            city: r.lead?.organization?.city || '',
            outcome: r.outcome || '',
        }));
        return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
    }
};
exports.FieldTeamTrackerReport = FieldTeamTrackerReport;
exports.FieldTeamTrackerReport = FieldTeamTrackerReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], FieldTeamTrackerReport);
//# sourceMappingURL=field-team-tracker.report.js.map