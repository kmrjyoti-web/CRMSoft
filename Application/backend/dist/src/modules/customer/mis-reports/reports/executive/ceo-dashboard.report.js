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
exports.CeoDashboardReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let CeoDashboardReport = class CeoDashboardReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CEO_DASHBOARD';
        this.name = 'CEO Dashboard';
        this.category = 'EXECUTIVE';
        this.description = 'High-level executive dashboard with 10 KPI cards, 7-day trends, top deals, and quick alerts';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
        ];
    }
    async generate(params) {
        const tenantId = params.tenantId;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);
        const wonLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: 'WON', updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
            select: { id: true, expectedValue: true, updatedAt: true },
        });
        const revenue = wonLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const activeLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, status: { notIn: ['WON', 'LOST'] } },
            select: { id: true, expectedValue: true, expectedCloseDate: true, leadNumber: true,
                contact: { select: { firstName: true, lastName: true } },
                organization: { select: { name: true } },
            },
            orderBy: { expectedValue: 'desc' },
        });
        const pipelineValue = activeLeads.reduce((s, l) => s + Number(l.expectedValue || 0), 0);
        const leadsWon = wonLeads.length;
        const totalLeadsInPeriod = await this.prisma.working.lead.count({
            where: { tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } },
        });
        const allLeadsInPeriod = await this.prisma.working.lead.count({
            where: { tenantId, updatedAt: { gte: params.dateFrom, lte: params.dateTo } },
        });
        const conversionRate = allLeadsInPeriod > 0
            ? Math.round((leadsWon / allLeadsInPeriod) * 10000) / 100
            : 0;
        const quotationsSent = await this.prisma.working.quotation.count({
            where: { tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } },
        });
        const activeDeals = activeLeads.length;
        const avgDealSize = activeDeals > 0
            ? Math.round(pipelineValue / activeDeals)
            : 0;
        const targets = await this.prisma.working.salesTarget.findMany({
            where: { tenantId, isActive: true },
            select: { achievedPercent: true },
        });
        const teamScore = targets.length > 0
            ? Math.round(targets.reduce((s, t) => s + Number(t.achievedPercent), 0) / targets.length * 100) / 100
            : 0;
        const activitiesToday = await this.prisma.working.activity.count({
            where: { tenantId, createdAt: { gte: todayStart, lte: todayEnd } },
        });
        const expiringQuotations = await this.prisma.working.quotation.count({
            where: { tenantId, status: { notIn: ['ACCEPTED', 'REJECTED', 'CANCELLED'] },
                validUntil: { gte: todayStart, lte: new Date(todayStart.getTime() + 3 * 86400000) } },
        });
        const belowTargetMembers = targets.filter(t => Number(t.achievedPercent) < 50).length;
        const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);
        const revenueByDay = new Map();
        const leadsByDay = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo.getTime() + i * 86400000);
            revenueByDay.set(d.toISOString().slice(0, 10), 0);
            leadsByDay.set(d.toISOString().slice(0, 10), 0);
        }
        const recentWon = wonLeads.filter(l => l.updatedAt >= sevenDaysAgo);
        recentWon.forEach(l => {
            const day = l.updatedAt.toISOString().slice(0, 10);
            if (revenueByDay.has(day))
                revenueByDay.set(day, revenueByDay.get(day) + Number(l.expectedValue || 0));
        });
        const recentLeads = await this.prisma.working.lead.findMany({
            where: { tenantId, createdAt: { gte: sevenDaysAgo, lte: todayEnd } },
            select: { createdAt: true },
        });
        recentLeads.forEach(l => {
            const day = l.createdAt.toISOString().slice(0, 10);
            if (leadsByDay.has(day))
                leadsByDay.set(day, leadsByDay.get(day) + 1);
        });
        const trendDays = [...revenueByDay.keys()].sort();
        const summary = [
            { key: 'revenue', label: 'Revenue', value: revenue, format: 'currency' },
            { key: 'pipelineValue', label: 'Pipeline Value', value: pipelineValue, format: 'currency' },
            { key: 'leadsWon', label: 'Leads Won', value: leadsWon, format: 'number' },
            { key: 'conversionRate', label: 'Conversion Rate', value: conversionRate, format: 'percent' },
            { key: 'newLeads', label: 'New Leads', value: totalLeadsInPeriod, format: 'number' },
            { key: 'quotationsSent', label: 'Quotations Sent', value: quotationsSent, format: 'number' },
            { key: 'activeDeals', label: 'Active Deals', value: activeDeals, format: 'number' },
            { key: 'avgDealSize', label: 'Avg Deal Size', value: avgDealSize, format: 'currency' },
            { key: 'teamScore', label: 'Team Score', value: teamScore, format: 'percent' },
            { key: 'activitiesToday', label: 'Activities Today', value: activitiesToday, format: 'number' },
        ];
        const charts = [
            {
                type: 'LINE', title: 'Revenue Trend (7 Days)',
                labels: trendDays,
                datasets: [{ label: 'Revenue', data: trendDays.map(d => revenueByDay.get(d)), color: '#4CAF50' }],
            },
            {
                type: 'LINE', title: 'New Leads Trend (7 Days)',
                labels: trendDays,
                datasets: [{ label: 'New Leads', data: trendDays.map(d => leadsByDay.get(d)), color: '#2196F3' }],
            },
        ];
        const topDeals = activeLeads.slice(0, 5).map(l => ({
            leadNumber: l.leadNumber,
            contact: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : '',
            organization: l.organization?.name || '',
            expectedValue: Number(l.expectedValue || 0),
            expectedCloseDate: l.expectedCloseDate,
        }));
        const dealCols = [
            { key: 'leadNumber', header: 'Lead #', width: 16 },
            { key: 'contact', header: 'Contact', width: 20 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'expectedValue', header: 'Value', width: 16, format: 'currency' },
            { key: 'expectedCloseDate', header: 'Expected Close', width: 15, format: 'date' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Top 5 Deals', columns: dealCols, rows: topDeals }],
            metadata: {
                alerts: {
                    expiringQuotations,
                    belowTargetMembers,
                    leadsWonToday: recentWon.filter(l => l.updatedAt >= todayStart).length,
                },
            },
        };
    }
};
exports.CeoDashboardReport = CeoDashboardReport;
exports.CeoDashboardReport = CeoDashboardReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], CeoDashboardReport);
//# sourceMappingURL=ceo-dashboard.report.js.map