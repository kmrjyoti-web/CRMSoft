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
exports.ProductWiseQuotationReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let ProductWiseQuotationReport = class ProductWiseQuotationReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'PRODUCT_WISE_QUOTATION';
        this.name = 'Product-wise Quotation Analysis';
        this.category = 'QUOTATION';
        this.description = 'Breaks down quotation performance by product including quote frequency, value, and acceptance rates';
        this.supportsDrillDown = true;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'createdById', label: 'Created By', type: 'user' },
            { key: 'productName', label: 'Product Name', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            quotation: { createdAt: { gte: params.dateFrom, lte: params.dateTo } },
        };
        if (params.userId)
            where.quotation.createdById = params.userId;
        if (params.filters?.productName)
            where.productName = { contains: params.filters.productName, mode: 'insensitive' };
        const lineItems = await this.prisma.working.quotationLineItem.findMany({
            where,
            include: {
                quotation: { select: { status: true } },
            },
        });
        const productMap = new Map();
        for (const li of lineItems) {
            const name = li.productName;
            const entry = productMap.get(name) || {
                timesQuoted: 0, totalQuantity: 0, totalValue: 0,
                prices: [], accepted: 0, rejected: 0, pending: 0,
            };
            entry.timesQuoted++;
            entry.totalQuantity += Number(li.quantity);
            entry.totalValue += Number(li.lineTotal);
            entry.prices.push(Number(li.unitPrice));
            const st = li.quotation.status;
            if (st === 'ACCEPTED')
                entry.accepted++;
            else if (st === 'REJECTED')
                entry.rejected++;
            else if (['SENT', 'VIEWED', 'NEGOTIATION'].includes(st))
                entry.pending++;
            productMap.set(name, entry);
        }
        const products = [...productMap.entries()].map(([name, data]) => ({
            productName: name,
            timesQuoted: data.timesQuoted,
            totalQuantity: Math.round(data.totalQuantity * 100) / 100,
            totalValue: Math.round(data.totalValue * 100) / 100,
            avgUnitPrice: data.prices.length > 0
                ? Math.round((data.prices.reduce((a, b) => a + b, 0) / data.prices.length) * 100) / 100 : 0,
            accepted: data.accepted,
            rejected: data.rejected,
            pending: data.pending,
            acceptanceRate: data.accepted + data.rejected > 0
                ? Math.round((data.accepted / (data.accepted + data.rejected)) * 10000) / 100 : 0,
        }));
        const totalProducts = products.length;
        const topByQuoted = products.reduce((top, p) => p.timesQuoted > (top?.timesQuoted || 0) ? p : top, products[0]);
        const topByRevenue = products.reduce((top, p) => p.totalValue > (top?.totalValue || 0) ? p : top, products[0]);
        const summary = [
            { key: 'totalProducts', label: 'Total Products', value: totalProducts, format: 'number' },
            { key: 'topProduct', label: `Top Product (by Quotes): ${topByQuoted?.productName || 'N/A'}`, value: topByQuoted?.timesQuoted || 0, format: 'number' },
            { key: 'topProductByRevenue', label: `Top Product (by Revenue): ${topByRevenue?.productName || 'N/A'}`, value: topByRevenue?.totalValue || 0, format: 'currency' },
        ];
        const sortedByQuotes = [...products].sort((a, b) => b.timesQuoted - a.timesQuoted).slice(0, 15);
        const quotedChart = {
            type: 'BAR', title: 'Times Quoted by Product',
            labels: sortedByQuotes.map(p => p.productName),
            datasets: [{ label: 'Times Quoted', data: sortedByQuotes.map(p => p.timesQuoted), color: '#2196F3' }],
        };
        const sortedByVolume = [...products].sort((a, b) => b.timesQuoted - a.timesQuoted).slice(0, 15);
        const acceptanceChart = {
            type: 'BAR', title: 'Acceptance Rate by Product',
            labels: sortedByVolume.map(p => p.productName),
            datasets: [{ label: 'Acceptance Rate %', data: sortedByVolume.map(p => p.acceptanceRate), color: '#4CAF50' }],
        };
        const tableRows = [...products].sort((a, b) => b.totalValue - a.totalValue);
        const tableCols = [
            { key: 'productName', header: 'Product', width: 22 },
            { key: 'timesQuoted', header: 'Quoted', width: 10, format: 'number' },
            { key: 'totalQuantity', header: 'Total Qty', width: 10, format: 'number' },
            { key: 'totalValue', header: 'Total Value', width: 14, format: 'currency' },
            { key: 'avgUnitPrice', header: 'Avg Price', width: 12, format: 'currency' },
            { key: 'accepted', header: 'Accepted', width: 10, format: 'number' },
            { key: 'rejected', header: 'Rejected', width: 10, format: 'number' },
            { key: 'pending', header: 'Pending', width: 10, format: 'number' },
            { key: 'acceptanceRate', header: 'Accept Rate', width: 12, format: 'percent' },
        ];
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [quotedChart, acceptanceChart],
            tables: [{ title: 'Product Breakdown', columns: tableCols, rows: tableRows }],
        };
    }
    async drillDown(params) {
        const where = {
            tenantId: params.filters?.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
        };
        if (params.dimension === 'product') {
            where.lineItems = { some: { productName: params.value } };
        }
        const skip = (params.page - 1) * params.limit;
        const [records, total] = await Promise.all([
            this.prisma.working.quotation.findMany({
                where, skip, take: params.limit, orderBy: { createdAt: 'desc' },
                include: {
                    lineItems: { where: { productName: params.value }, select: { quantity: true, unitPrice: true, lineTotal: true } },
                    createdByUser: { select: { firstName: true, lastName: true } },
                },
            }),
            this.prisma.working.quotation.count({ where }),
        ]);
        const columns = [
            { key: 'quotationNo', header: 'Quotation #', width: 16 },
            { key: 'status', header: 'Status', width: 14 },
            { key: 'quantity', header: 'Quantity', width: 10, format: 'number' },
            { key: 'unitPrice', header: 'Unit Price', width: 12, format: 'currency' },
            { key: 'lineTotal', header: 'Line Total', width: 14, format: 'currency' },
            { key: 'createdBy', header: 'Created By', width: 18 },
            { key: 'createdAt', header: 'Created', width: 14, format: 'date' },
        ];
        const rows = records.map(q => {
            const li = q.lineItems[0];
            return {
                quotationNo: q.quotationNo,
                status: q.status,
                quantity: li ? Number(li.quantity) : 0,
                unitPrice: li ? Number(li.unitPrice) : 0,
                lineTotal: li ? Number(li.lineTotal) : 0,
                createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
                createdAt: q.createdAt,
            };
        });
        return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
    }
};
exports.ProductWiseQuotationReport = ProductWiseQuotationReport;
exports.ProductWiseQuotationReport = ProductWiseQuotationReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], ProductWiseQuotationReport);
//# sourceMappingURL=product-wise-quotation.report.js.map