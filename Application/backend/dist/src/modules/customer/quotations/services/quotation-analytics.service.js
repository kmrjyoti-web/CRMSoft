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
exports.QuotationAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let QuotationAnalyticsService = class QuotationAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(params) {
        const where = this.buildDateWhere(params);
        const all = await this.prisma.working.quotation.findMany({
            where,
            select: { id: true, status: true, totalAmount: true, createdAt: true, acceptedAt: true },
        });
        const byStatus = {};
        let totalValue = 0;
        let acceptedCount = 0;
        let rejectedCount = 0;
        let totalDaysToClose = 0;
        let closedCount = 0;
        for (const q of all) {
            byStatus[q.status] = (byStatus[q.status] || 0) + 1;
            totalValue += Number(q.totalAmount);
            if (q.status === 'ACCEPTED') {
                acceptedCount++;
                if (q.acceptedAt && q.createdAt) {
                    totalDaysToClose += (q.acceptedAt.getTime() - q.createdAt.getTime()) / 86400000;
                    closedCount++;
                }
            }
            if (q.status === 'REJECTED')
                rejectedCount++;
        }
        const decided = acceptedCount + rejectedCount;
        const conversionRate = decided > 0 ? Math.round(acceptedCount / decided * 1000) / 10 : 0;
        const avgDealSize = acceptedCount > 0 ? Math.round(totalValue / all.length) : 0;
        const avgTimeToClose = closedCount > 0 ? Math.round(totalDaysToClose / closedCount * 10) / 10 : 0;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = all.filter((q) => q.createdAt >= thisMonthStart);
        const lastMonth = all.filter((q) => q.createdAt >= lastMonthStart && q.createdAt < thisMonthStart);
        const thisMonthAccepted = thisMonth.filter((q) => q.status === 'ACCEPTED').length;
        const lastMonthAccepted = lastMonth.filter((q) => q.status === 'ACCEPTED').length;
        const trend = lastMonthAccepted > 0
            ? `${Math.round((thisMonthAccepted - lastMonthAccepted) / lastMonthAccepted * 100)}%`
            : 'N/A';
        return {
            totalQuotations: all.length, totalValue, byStatus,
            conversionRate, avgDealSize, avgTimeToClose,
            thisMonth: { total: thisMonth.length, accepted: thisMonthAccepted },
            lastMonth: { total: lastMonth.length, accepted: lastMonthAccepted },
            trend,
        };
    }
    async getConversionFunnel(params) {
        const where = this.buildDateWhere(params);
        const all = await this.prisma.working.quotation.findMany({
            where,
            select: { id: true, status: true, totalAmount: true },
        });
        const stages = ['DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED'];
        const statusOrder = { DRAFT: 0, INTERNAL_REVIEW: 0, SENT: 1, VIEWED: 2, NEGOTIATION: 3, ACCEPTED: 4, REJECTED: 3, EXPIRED: 2, REVISED: 2, CANCELLED: 0 };
        const funnel = stages.map((stage, idx) => {
            const reached = all.filter((q) => (statusOrder[q.status] ?? 0) >= idx);
            const value = reached.reduce((sum, q) => sum + Number(q.totalAmount), 0);
            const prev = idx > 0 ? all.filter((q) => (statusOrder[q.status] ?? 0) >= idx - 1).length : all.length;
            const dropOff = prev > 0 && idx > 0 ? `${Math.round((1 - reached.length / prev) * 1000) / 10}%` : '0%';
            return { stage, count: reached.length, value: Math.round(value), dropOff };
        });
        const created = all.length;
        const accepted = all.filter((q) => q.status === 'ACCEPTED').length;
        return { stages: funnel, overallConversion: created > 0 ? `${Math.round(accepted / created * 100)}%` : '0%' };
    }
    async getIndustryAnalysis(params) {
        const where = this.buildDateWhere(params);
        const quotations = await this.prisma.working.quotation.findMany({
            where,
            select: {
                id: true, status: true, totalAmount: true, discountValue: true,
                createdAt: true, acceptedAt: true, rejectedReason: true,
                lead: { select: { organization: { select: { industry: true } } } },
                lineItems: { select: { productName: true } },
            },
        });
        const byIndustry = {};
        for (const q of quotations) {
            const industry = q.lead?.organization?.industry || 'Unknown';
            if (!byIndustry[industry])
                byIndustry[industry] = [];
            byIndustry[industry].push(q);
        }
        return Object.entries(byIndustry).map(([industry, qs]) => {
            const accepted = qs.filter((q) => q.status === 'ACCEPTED');
            const rejected = qs.filter((q) => q.status === 'REJECTED');
            const decided = accepted.length + rejected.length;
            const totalValue = accepted.reduce((s, q) => s + Number(q.totalAmount), 0);
            return {
                industry, totalQuotations: qs.length,
                accepted: accepted.length, rejected: rejected.length,
                pending: qs.length - decided,
                conversionRate: decided > 0 ? Math.round(accepted.length / decided * 100) : 0,
                totalValue, avgDealSize: accepted.length > 0 ? Math.round(totalValue / accepted.length) : 0,
            };
        }).sort((a, b) => b.totalQuotations - a.totalQuotations);
    }
    async getProductAnalysis(params) {
        const where = this.buildDateWhere(params);
        const quotations = await this.prisma.working.quotation.findMany({
            where,
            select: {
                id: true, status: true,
                lineItems: { select: { productId: true, productName: true, productCode: true, quantity: true, lineTotal: true, discountAmount: true } },
            },
        });
        const productMap = {};
        for (const q of quotations) {
            for (const item of q.lineItems) {
                const key = item.productId || item.productName;
                if (!productMap[key]) {
                    productMap[key] = {
                        productId: item.productId, productName: item.productName, productCode: item.productCode,
                        timesQuoted: 0, totalQuantity: 0, totalRevenue: 0, quotationIds: new Set(), acceptedIds: new Set(),
                    };
                }
                productMap[key].timesQuoted++;
                productMap[key].totalQuantity += Number(item.quantity);
                productMap[key].quotationIds.add(q.id);
                if (q.status === 'ACCEPTED') {
                    productMap[key].totalRevenue += Number(item.lineTotal);
                    productMap[key].acceptedIds.add(q.id);
                }
            }
        }
        return Object.values(productMap).map((p) => ({
            productId: p.productId, productName: p.productName, productCode: p.productCode,
            timesQuoted: p.quotationIds.size, totalQuantity: p.totalQuantity,
            totalRevenue: Math.round(p.totalRevenue),
            conversionRate: p.quotationIds.size > 0 ? Math.round(p.acceptedIds.size / p.quotationIds.size * 100) : 0,
        })).sort((a, b) => b.timesQuoted - a.timesQuoted);
    }
    async getBestQuotations(params) {
        return this.prisma.working.quotation.findMany({
            where: { status: 'ACCEPTED' },
            orderBy: { totalAmount: 'desc' },
            take: params.limit || 10,
            include: {
                lineItems: { select: { productName: true, lineTotal: true } },
                lead: { select: { leadNumber: true, organization: { select: { name: true, industry: true } } } },
                createdByUser: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async compareQuotations(ids) {
        const quotations = await this.prisma.working.quotation.findMany({
            where: { id: { in: ids } },
            include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
        });
        const allProducts = new Set();
        for (const q of quotations) {
            for (const item of q.lineItems)
                allProducts.add(item.productName);
        }
        return {
            quotations: quotations.map((q) => ({
                id: q.id, quotationNo: q.quotationNo, status: q.status, version: q.version,
                totalAmount: q.totalAmount, discountType: q.discountType, discountValue: q.discountValue,
                itemCount: q.lineItems.length,
            })),
            products: Array.from(allProducts),
            differences: {
                pricing: quotations.map((q) => ({
                    quotationNo: q.quotationNo, subtotal: q.subtotal, totalAmount: q.totalAmount, totalTax: q.totalTax,
                })),
            },
        };
    }
    buildDateWhere(params) {
        const where = {};
        if (params.userId)
            where.createdById = params.userId;
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom)
                where.createdAt.gte = params.dateFrom;
            if (params.dateTo)
                where.createdAt.lte = params.dateTo;
        }
        return where;
    }
};
exports.QuotationAnalyticsService = QuotationAnalyticsService;
exports.QuotationAnalyticsService = QuotationAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotationAnalyticsService);
//# sourceMappingURL=quotation-analytics.service.js.map