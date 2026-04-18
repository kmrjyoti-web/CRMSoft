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
exports.SalesTrendReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let SalesTrendReport = class SalesTrendReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'SALES_TREND';
        this.name = 'Sales Trend';
        this.category = 'SALES';
        this.description = 'Rolling monthly revenue trend with cumulative view and month-over-month growth';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'allocatedToId', label: 'Sales Rep', type: 'user' },
            { key: 'months', label: 'Months to Show', type: 'select', options: [
                    { value: '6', label: '6 Months' }, { value: '9', label: '9 Months' },
                    { value: '12', label: '12 Months' },
                ], defaultValue: '12' },
        ];
    }
    async generate(params) {
        const monthCount = parseInt(params.filters?.months || '12', 10);
        const endDate = params.dateTo;
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - monthCount);
        const where = {
            tenantId: params.tenantId,
            status: 'WON',
            updatedAt: { gte: startDate, lte: endDate },
        };
        if (params.userId)
            where.allocatedToId = params.userId;
        const wonLeads = await this.prisma.working.lead.findMany({
            where,
            select: { expectedValue: true, updatedAt: true },
        });
        const monthlyMap = new Map();
        const months = [];
        for (let i = 0; i < monthCount; i++) {
            const d = new Date(endDate);
            d.setMonth(d.getMonth() - (monthCount - 1 - i));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push(key);
            monthlyMap.set(key, { revenue: 0, deals: 0 });
        }
        wonLeads.forEach(l => {
            const key = `${l.updatedAt.getFullYear()}-${String(l.updatedAt.getMonth() + 1).padStart(2, '0')}`;
            const entry = monthlyMap.get(key);
            if (entry) {
                entry.revenue += Number(l.expectedValue || 0);
                entry.deals++;
            }
        });
        const monthlyData = months.map(m => monthlyMap.get(m));
        const revenueValues = monthlyData.map(d => d.revenue);
        const currentMonthRevenue = revenueValues[revenueValues.length - 1] || 0;
        const prevMonthRevenue = revenueValues.length >= 2 ? revenueValues[revenueValues.length - 2] : 0;
        const monthOverMonthGrowth = prevMonthRevenue > 0
            ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 10000) / 100
            : 0;
        const avgMonthlyRevenue = revenueValues.length > 0
            ? Math.round(revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length)
            : 0;
        const summary = [
            { key: 'currentMonthRevenue', label: 'Current Month Revenue', value: currentMonthRevenue, format: 'currency' },
            { key: 'prevMonthRevenue', label: 'Previous Month Revenue', value: prevMonthRevenue, format: 'currency' },
            { key: 'monthOverMonthGrowth', label: 'MoM Growth', value: monthOverMonthGrowth, format: 'percent' },
            { key: 'avgMonthlyRevenue', label: 'Avg Monthly Revenue', value: avgMonthlyRevenue, format: 'currency' },
        ];
        const revenueLine = {
            type: 'LINE', title: 'Monthly Revenue Trend',
            labels: months,
            datasets: [{ label: 'Revenue', data: revenueValues, color: '#2196F3' }],
        };
        let cumulative = 0;
        const cumulativeData = revenueValues.map(v => { cumulative += v; return cumulative; });
        const cumulativeArea = {
            type: 'AREA', title: 'Cumulative Revenue',
            labels: months,
            datasets: [{ label: 'Cumulative Revenue', data: cumulativeData, color: '#4CAF50' }],
        };
        const tableRows = months.map((month, idx) => {
            const data = monthlyData[idx];
            const prevRev = idx > 0 ? monthlyData[idx - 1].revenue : 0;
            const growth = prevRev > 0
                ? Math.round(((data.revenue - prevRev) / prevRev) * 10000) / 100
                : 0;
            return {
                month,
                revenue: data.revenue,
                deals: data.deals,
                avgDealSize: data.deals > 0 ? Math.round(data.revenue / data.deals) : 0,
                growthPercent: growth,
            };
        });
        const tableCols = [
            { key: 'month', header: 'Month', width: 12 },
            { key: 'revenue', header: 'Revenue', width: 16, format: 'currency' },
            { key: 'deals', header: 'Deals', width: 10, format: 'number' },
            { key: 'avgDealSize', header: 'Avg Deal Size', width: 16, format: 'currency' },
            { key: 'growthPercent', header: 'Growth %', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [revenueLine, cumulativeArea],
            tables: [{ title: 'Monthly Revenue Data', columns: tableCols, rows: tableRows }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            status: 'WON',
        };
        if (params.dimension === 'month') {
            const [year, month] = params.value.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            where.updatedAt = { gte: start, lte: end };
        }
        const result = await this.drillDownSvc.getLeads(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
};
exports.SalesTrendReport = SalesTrendReport;
exports.SalesTrendReport = SalesTrendReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], SalesTrendReport);
//# sourceMappingURL=sales-trend.report.js.map