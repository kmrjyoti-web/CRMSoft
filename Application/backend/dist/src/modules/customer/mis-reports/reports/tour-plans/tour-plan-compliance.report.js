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
exports.TourPlanComplianceReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let TourPlanComplianceReport = class TourPlanComplianceReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'TOUR_PLAN_COMPLIANCE';
        this.name = 'Tour Plan Compliance';
        this.category = 'TOUR_PLAN';
        this.description = 'Tracks tour plan approval-to-completion rates and visit-level compliance per sales person';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'salesPersonId', label: 'Sales Person', type: 'user' },
            { key: 'status', label: 'Plan Status', type: 'select', options: [
                    { value: 'APPROVED', label: 'Approved' }, { value: 'COMPLETED', label: 'Completed' },
                    { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'CANCELLED', label: 'Cancelled' },
                ] },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            planDate: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.salesPersonId = params.userId;
        if (params.filters?.status)
            where.status = params.filters.status;
        const plans = await this.prisma.working.tourPlan.findMany({
            where,
            select: {
                id: true, planDate: true, status: true,
                salesPerson: { select: { id: true, firstName: true, lastName: true } },
                visits: { select: { id: true, isCompleted: true, actualArrival: true } },
            },
        });
        const userMap = new Map();
        plans.forEach(p => {
            const uid = p.salesPerson.id;
            const uName = `${p.salesPerson.firstName} ${p.salesPerson.lastName}`;
            if (!userMap.has(uid)) {
                userMap.set(uid, { name: uName, total: 0, approved: 0, completed: 0, plannedVisits: 0, completedVisits: 0, checkedIn: 0 });
            }
            const e = userMap.get(uid);
            e.total++;
            if (['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p.status))
                e.approved++;
            if (p.status === 'COMPLETED')
                e.completed++;
            e.plannedVisits += p.visits.length;
            e.completedVisits += p.visits.filter(v => v.isCompleted).length;
            e.checkedIn += p.visits.filter(v => v.actualArrival != null).length;
        });
        const userStats = [...userMap.entries()].map(([userId, d]) => ({
            userId, name: d.name, totalPlans: d.total, approved: d.approved, completed: d.completed,
            complianceRate: d.approved > 0 ? Math.round((d.completed / d.approved) * 10000) / 100 : 0,
            plannedVisits: d.plannedVisits, completedVisits: d.completedVisits, checkedIn: d.checkedIn,
            visitCompliance: d.plannedVisits > 0 ? Math.round((d.completedVisits / d.plannedVisits) * 10000) / 100 : 0,
        }));
        userStats.sort((a, b) => b.complianceRate - a.complianceRate);
        const totalApproved = userStats.reduce((s, u) => s + u.approved, 0);
        const totalCompleted = userStats.reduce((s, u) => s + u.completed, 0);
        const overallCompliance = totalApproved > 0 ? Math.round((totalCompleted / totalApproved) * 10000) / 100 : 0;
        const totalVisits = userStats.reduce((s, u) => s + u.plannedVisits, 0);
        const uniqueDays = new Set(plans.map(p => p.planDate.toISOString().slice(0, 10))).size;
        const weekMap = new Map();
        plans.forEach(p => {
            const d = new Date(p.planDate);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().slice(0, 10);
            if (!weekMap.has(key))
                weekMap.set(key, { approved: 0, completed: 0 });
            const w = weekMap.get(key);
            if (['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p.status))
                w.approved++;
            if (p.status === 'COMPLETED')
                w.completed++;
        });
        const weeks = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        const summary = [
            { key: 'overallCompliance', label: 'Overall Compliance', value: overallCompliance, format: 'percent' },
            { key: 'bestCompliance', label: 'Best Compliance', value: userStats[0]?.complianceRate || 0, format: 'percent' },
            { key: 'worstCompliance', label: 'Worst Compliance', value: userStats[userStats.length - 1]?.complianceRate || 0, format: 'percent' },
            { key: 'totalFieldDays', label: 'Total Field Days', value: uniqueDays, format: 'number' },
            { key: 'totalVisits', label: 'Total Visits', value: totalVisits, format: 'number' },
        ];
        const charts = [
            {
                type: 'BAR', title: 'Compliance Rate by User',
                labels: userStats.map(u => u.name),
                datasets: [{ label: 'Compliance %', data: userStats.map(u => u.complianceRate), color: '#2196F3' }],
            },
            {
                type: 'LINE', title: 'Weekly Compliance Trend',
                labels: weeks.map(w => w[0]),
                datasets: [{
                        label: 'Compliance %',
                        data: weeks.map(w => w[1].approved > 0 ? Math.round((w[1].completed / w[1].approved) * 10000) / 100 : 0),
                        color: '#4CAF50',
                    }],
            },
        ];
        const tableColumns = [
            { key: 'name', header: 'Sales Person', width: 22 },
            { key: 'totalPlans', header: 'Total Plans', width: 12, format: 'number' },
            { key: 'approved', header: 'Approved', width: 10, format: 'number' },
            { key: 'completed', header: 'Completed', width: 10, format: 'number' },
            { key: 'complianceRate', header: 'Plan Compliance %', width: 16, format: 'percent' },
            { key: 'plannedVisits', header: 'Planned Visits', width: 14, format: 'number' },
            { key: 'completedVisits', header: 'Done Visits', width: 12, format: 'number' },
            { key: 'visitCompliance', header: 'Visit Compliance %', width: 16, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Per User Compliance Breakdown', columns: tableColumns, rows: userStats }],
            metadata: {
                bestUser: userStats[0]?.name || 'N/A',
                worstUser: userStats[userStats.length - 1]?.name || 'N/A',
            },
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            planDate: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'user')
            where.salesPersonId = params.value;
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.TourPlanComplianceReport = TourPlanComplianceReport;
exports.TourPlanComplianceReport = TourPlanComplianceReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], TourPlanComplianceReport);
//# sourceMappingURL=tour-plan-compliance.report.js.map