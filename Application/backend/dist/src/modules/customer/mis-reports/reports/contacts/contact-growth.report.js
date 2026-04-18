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
exports.ContactGrowthReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let ContactGrowthReport = class ContactGrowthReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'CONTACT_GROWTH';
        this.name = 'Contact Growth';
        this.category = 'CONTACT_ORG';
        this.description = 'Tracks new contacts added over time with cumulative growth curve and monthly breakdown';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
            { key: 'createdById', label: 'Created By', type: 'user' },
            { key: 'isActive', label: 'Active Only', type: 'boolean', defaultValue: true },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.userId)
            where.createdById = params.userId;
        if (params.filters?.isActive !== undefined)
            where.isActive = params.filters.isActive;
        const contacts = await this.prisma.working.contact.findMany({
            where,
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const totalContacts = await this.prisma.working.contact.count({
            where: { tenantId: params.tenantId },
        });
        const newInPeriod = contacts.length;
        const months = this.getMonthRange(params.dateFrom, params.dateTo);
        const monthlyMap = new Map();
        months.forEach(m => monthlyMap.set(m, 0));
        contacts.forEach(c => {
            const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        });
        const monthLabels = [...monthlyMap.keys()].sort();
        const monthlyData = monthLabels.map(m => monthlyMap.get(m));
        const avgPerMonth = monthLabels.length > 0
            ? Math.round(newInPeriod / monthLabels.length)
            : 0;
        const prePeriodCount = await this.prisma.working.contact.count({
            where: { tenantId: params.tenantId, createdAt: { lt: params.dateFrom } },
        });
        let running = prePeriodCount;
        const cumulativeData = monthlyData.map(v => { running += v; return running; });
        const growthRate = prePeriodCount > 0
            ? Math.round((newInPeriod / prePeriodCount) * 10000) / 100
            : 0;
        const summary = [
            { key: 'totalContacts', label: 'Total Contacts', value: totalContacts, format: 'number' },
            { key: 'newInPeriod', label: 'New in Period', value: newInPeriod, format: 'number' },
            { key: 'growthRate', label: 'Growth Rate', value: growthRate, format: 'percent' },
            { key: 'avgPerMonth', label: 'Avg per Month', value: avgPerMonth, format: 'number' },
        ];
        const charts = [
            {
                type: 'LINE', title: 'New Contacts by Month',
                labels: monthLabels,
                datasets: [{ label: 'New Contacts', data: monthlyData, color: '#4CAF50' }],
            },
            {
                type: 'AREA', title: 'Cumulative Contacts',
                labels: monthLabels,
                datasets: [{ label: 'Cumulative', data: cumulativeData, color: '#2196F3' }],
            },
        ];
        const tableColumns = [
            { key: 'month', header: 'Month', width: 12 },
            { key: 'newContacts', header: 'New Contacts', width: 14, format: 'number' },
            { key: 'cumulative', header: 'Cumulative', width: 14, format: 'number' },
        ];
        const tableRows = monthLabels.map((m, i) => ({
            month: m,
            newContacts: monthlyData[i],
            cumulative: cumulativeData[i],
        }));
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts,
            tables: [{ title: 'Monthly Contact Growth', columns: tableColumns, rows: tableRows }],
        };
    }
    async drillDown(params) {
        const where = { tenantId: params.filters?.tenantId };
        if (params.dimension === 'month') {
            const [year, month] = params.value.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            where.createdAt = { gte: start, lte: end };
        }
        else {
            where.createdAt = { gte: params.dateFrom, lte: params.dateTo };
        }
        const result = await this.drillDownSvc.getContacts(where, params.page, params.limit);
        return { ...result, dimension: params.dimension, value: params.value };
    }
    getMonthRange(from, to) {
        const months = [];
        const current = new Date(from.getFullYear(), from.getMonth(), 1);
        while (current <= to) {
            months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    }
};
exports.ContactGrowthReport = ContactGrowthReport;
exports.ContactGrowthReport = ContactGrowthReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ContactGrowthReport);
//# sourceMappingURL=contact-growth.report.js.map