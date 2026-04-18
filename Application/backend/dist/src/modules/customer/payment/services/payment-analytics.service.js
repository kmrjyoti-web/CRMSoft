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
exports.PaymentAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PaymentAnalyticsService = class PaymentAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCollectionSummary(tenantId, fromDate, toDate) {
        const where = { tenantId, status: { in: ['CAPTURED', 'PAID'] } };
        if (fromDate || toDate) {
            where.paidAt = {};
            if (fromDate)
                where.paidAt.gte = new Date(fromDate);
            if (toDate)
                where.paidAt.lte = new Date(toDate);
        }
        const [totalCollected, byMethod, byGateway] = await Promise.all([
            this.prisma.working.payment.aggregate({
                where,
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.working.payment.groupBy({
                by: ['method'],
                where,
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.working.payment.groupBy({
                by: ['gateway'],
                where,
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            totalCollected: Number(totalCollected._sum.amount || 0),
            paymentCount: totalCollected._count,
            byMethod: byMethod.map((m) => ({
                method: m.method,
                amount: Number(m._sum.amount || 0),
                count: m._count,
            })),
            byGateway: byGateway.map((g) => ({
                gateway: g.gateway,
                amount: Number(g._sum.amount || 0),
                count: g._count,
            })),
        };
    }
    async getOutstandingSummary(tenantId) {
        const [overdue, partiallyPaid, sent] = await Promise.all([
            this.prisma.working.invoice.aggregate({
                where: { tenantId, status: 'OVERDUE' },
                _sum: { balanceAmount: true },
                _count: true,
            }),
            this.prisma.working.invoice.aggregate({
                where: { tenantId, status: 'PARTIALLY_PAID' },
                _sum: { balanceAmount: true },
                _count: true,
            }),
            this.prisma.working.invoice.aggregate({
                where: { tenantId, status: 'SENT' },
                _sum: { balanceAmount: true },
                _count: true,
            }),
        ]);
        return {
            overdue: { count: overdue._count, amount: Number(overdue._sum.balanceAmount || 0) },
            partiallyPaid: { count: partiallyPaid._count, amount: Number(partiallyPaid._sum.balanceAmount || 0) },
            pending: { count: sent._count, amount: Number(sent._sum.balanceAmount || 0) },
            totalOutstanding: Number(overdue._sum.balanceAmount || 0) +
                Number(partiallyPaid._sum.balanceAmount || 0) +
                Number(sent._sum.balanceAmount || 0),
        };
    }
    async getRefundSummary(tenantId) {
        const [total, byStatus] = await Promise.all([
            this.prisma.working.refund.aggregate({
                where: { tenantId },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.working.refund.groupBy({
                by: ['status'],
                where: { tenantId },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            totalRefunds: total._count,
            totalAmount: Number(total._sum.amount || 0),
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count,
                amount: Number(s._sum.amount || 0),
            })),
        };
    }
};
exports.PaymentAnalyticsService = PaymentAnalyticsService;
exports.PaymentAnalyticsService = PaymentAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentAnalyticsService);
//# sourceMappingURL=payment-analytics.service.js.map