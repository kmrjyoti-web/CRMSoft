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
exports.QuotationVsOrderReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let QuotationVsOrderReport = class QuotationVsOrderReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'QUOTATION_VS_ORDER';
        this.name = 'Quotation vs Order';
        this.category = 'QUOTATION';
        this.description = 'Compares quoted amounts against won deal values, highlighting discount patterns and revision impact';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = true;
        this.availableFilters = [
            { key: 'createdById', label: 'Created By', type: 'user' },
            { key: 'minDiscount', label: 'Min Discount %', type: 'text' },
            { key: 'maxDiscount', label: 'Max Discount %', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId, status: 'ACCEPTED',
            createdAt: { gte: params.dateFrom, lte: params.dateTo }, lead: { status: 'WON' },
        };
        if (params.userId)
            where.createdById = params.userId;
        const quotations = await this.prisma.working.quotation.findMany({
            where,
            include: {
                lead: { select: { expectedValue: true, allocatedTo: { select: { id: true, firstName: true, lastName: true } }, organization: { select: { name: true } } } },
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
                revisions: { select: { id: true } },
            },
        });
        const deals = quotations.map(q => {
            const quotedAmount = Number(q.totalAmount);
            const wonAmount = Number(q.lead?.expectedValue || 0);
            const discountPct = quotedAmount > 0 ? Math.round(((quotedAmount - wonAmount) / quotedAmount) * 10000) / 100 : 0;
            return { q, quotedAmount, wonAmount, discountPct, revisionCount: q.revisions?.length || 0 };
        });
        const totalQuoted = deals.reduce((s, d) => s + d.quotedAmount, 0);
        const totalWon = deals.reduce((s, d) => s + d.wonAmount, 0);
        const avgDiscountPct = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.discountPct, 0) / deals.length * 100) / 100 : 0;
        const avgRevisions = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.revisionCount, 0) / deals.length * 100) / 100 : 0;
        const summary = [
            { key: 'totalQuoted', label: 'Total Quoted', value: totalQuoted, format: 'currency' },
            { key: 'totalWon', label: 'Total Won', value: totalWon, format: 'currency' },
            { key: 'avgDiscountPercent', label: 'Avg Discount %', value: avgDiscountPct, format: 'percent' },
            { key: 'avgRevisions', label: 'Avg Revisions', value: avgRevisions, format: 'number' },
            { key: 'noDiscountDeals', label: 'No Discount Deals', value: deals.filter(d => d.discountPct <= 0).length, format: 'number' },
            { key: 'heavyDiscountDeals', label: 'Heavy Discount (>25%)', value: deals.filter(d => d.discountPct > 25).length, format: 'number' },
        ];
        const monthQuoted = new Map();
        const monthWon = new Map();
        deals.forEach(d => {
            const key = `${d.q.createdAt.getFullYear()}-${String(d.q.createdAt.getMonth() + 1).padStart(2, '0')}`;
            monthQuoted.set(key, (monthQuoted.get(key) || 0) + d.quotedAmount);
            monthWon.set(key, (monthWon.get(key) || 0) + d.wonAmount);
        });
        const months = [...new Set([...monthQuoted.keys(), ...monthWon.keys()])].sort();
        const quotedVsWonChart = {
            type: 'BAR', title: 'Quoted vs Won Amounts by Month', labels: months,
            datasets: [
                { label: 'Quoted', data: months.map(m => Math.round(monthQuoted.get(m) || 0)), color: '#2196F3' },
                { label: 'Won', data: months.map(m => Math.round(monthWon.get(m) || 0)), color: '#4CAF50' },
            ],
        };
        const userMap = new Map();
        deals.forEach(d => {
            const uid = d.q.createdByUser?.id || 'unknown';
            const name = d.q.createdByUser ? `${d.q.createdByUser.firstName} ${d.q.createdByUser.lastName}` : 'Unknown';
            const e = userMap.get(uid) || { name, totalPct: 0, count: 0 };
            e.totalPct += d.discountPct;
            e.count++;
            userMap.set(uid, e);
        });
        const users = [...userMap.values()].sort((a, b) => b.count - a.count);
        const discountChart = {
            type: 'BAR', title: 'Avg Discount % by User', labels: users.map(u => u.name),
            datasets: [{ label: 'Avg Discount %', data: users.map(u => u.count > 0 ? Math.round((u.totalPct / u.count) * 100) / 100 : 0), color: '#FF9800' }],
        };
        const userRows = users.map(u => ({
            userName: u.name, deals: u.count,
            avgDiscount: u.count > 0 ? Math.round((u.totalPct / u.count) * 100) / 100 : 0,
        }));
        const userCols = [
            { key: 'userName', header: 'User', width: 22 }, { key: 'deals', header: 'Deals', width: 10, format: 'number' },
            { key: 'avgDiscount', header: 'Avg Discount %', width: 14, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary, charts: [quotedVsWonChart, discountChart],
            tables: [{ title: 'Discount by User', columns: userCols, rows: userRows }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId, status: 'ACCEPTED',
            createdAt: { gte: params.dateFrom, lte: params.dateTo }, lead: { status: 'WON' },
        };
        if (params.dimension === 'user')
            where.createdById = params.value;
        const skip = (params.page - 1) * params.limit;
        const [records, total] = await Promise.all([
            this.prisma.working.quotation.findMany({
                where, skip, take: params.limit, orderBy: { createdAt: 'desc' },
                include: { lead: { select: { expectedValue: true, organization: { select: { name: true } } } }, createdByUser: { select: { firstName: true, lastName: true } } },
            }),
            this.prisma.working.quotation.count({ where }),
        ]);
        const columns = [
            { key: 'quotationNo', header: 'Quotation #', width: 16 }, { key: 'organization', header: 'Organization', width: 22 },
            { key: 'quotedAmount', header: 'Quoted', width: 14, format: 'currency' }, { key: 'wonAmount', header: 'Won', width: 14, format: 'currency' },
            { key: 'discountPct', header: 'Discount %', width: 12, format: 'percent' }, { key: 'createdBy', header: 'Created By', width: 18 },
        ];
        const rows = records.map(q => {
            const quoted = Number(q.totalAmount), won = Number(q.lead?.expectedValue || 0);
            return {
                quotationNo: q.quotationNo, organization: q.lead?.organization?.name || '',
                quotedAmount: quoted, wonAmount: won,
                discountPct: quoted > 0 ? Math.round(((quoted - won) / quoted) * 10000) / 100 : 0,
                createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
            };
        });
        return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
    }
};
exports.QuotationVsOrderReport = QuotationVsOrderReport;
exports.QuotationVsOrderReport = QuotationVsOrderReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, drill_down_service_1.DrillDownService])
], QuotationVsOrderReport);
//# sourceMappingURL=quotation-vs-order.report.js.map