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
exports.ProcurementDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ProcurementDashboardService = class ProcurementDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(tenantId) {
        const [rfqCounts, poCounts, grnCounts, invoiceCounts, recentPOs, pendingApprovals,] = await Promise.all([
            this.getRFQCounts(tenantId),
            this.getPOCounts(tenantId),
            this.getGRNCounts(tenantId),
            this.getInvoiceCounts(tenantId),
            this.getRecentPOs(tenantId),
            this.getPendingApprovals(tenantId),
        ]);
        return {
            rfq: rfqCounts,
            purchaseOrders: poCounts,
            goodsReceipts: grnCounts,
            invoices: invoiceCounts,
            recentPOs,
            pendingApprovals,
        };
    }
    async getRFQCounts(tenantId) {
        const [total, draft, sent, closed] = await Promise.all([
            this.prisma.working.purchaseRFQ.count({ where: { tenantId } }),
            this.prisma.working.purchaseRFQ.count({ where: { tenantId, status: 'DRAFT' } }),
            this.prisma.working.purchaseRFQ.count({ where: { tenantId, status: 'SENT' } }),
            this.prisma.working.purchaseRFQ.count({ where: { tenantId, status: 'CLOSED' } }),
        ]);
        return { total, draft, sent, closed };
    }
    async getPOCounts(tenantId) {
        const [total, draft, pendingApproval, approved, completed] = await Promise.all([
            this.prisma.working.purchaseOrder.count({ where: { tenantId } }),
            this.prisma.working.purchaseOrder.count({ where: { tenantId, status: 'DRAFT' } }),
            this.prisma.working.purchaseOrder.count({ where: { tenantId, status: 'PENDING_APPROVAL' } }),
            this.prisma.working.purchaseOrder.count({ where: { tenantId, status: 'APPROVED' } }),
            this.prisma.working.purchaseOrder.count({ where: { tenantId, status: 'COMPLETED' } }),
        ]);
        const totalValue = await this.prisma.working.purchaseOrder.aggregate({
            where: { tenantId, status: { in: ['APPROVED', 'PARTIALLY_RECEIVED', 'COMPLETED'] } },
            _sum: { grandTotal: true },
        });
        return {
            total, draft, pendingApproval, approved, completed,
            totalValue: totalValue._sum.grandTotal?.toNumber() ?? 0,
        };
    }
    async getGRNCounts(tenantId) {
        const [total, draft, accepted, rejected] = await Promise.all([
            this.prisma.working.goodsReceipt.count({ where: { tenantId } }),
            this.prisma.working.goodsReceipt.count({ where: { tenantId, status: 'DRAFT' } }),
            this.prisma.working.goodsReceipt.count({ where: { tenantId, status: 'ACCEPTED' } }),
            this.prisma.working.goodsReceipt.count({ where: { tenantId, status: 'REJECTED' } }),
        ]);
        return { total, draft, accepted, rejected };
    }
    async getInvoiceCounts(tenantId) {
        const [total, draft, pending, approved, paid] = await Promise.all([
            this.prisma.working.purchaseInvoice.count({ where: { tenantId } }),
            this.prisma.working.purchaseInvoice.count({ where: { tenantId, status: 'DRAFT' } }),
            this.prisma.working.purchaseInvoice.count({ where: { tenantId, status: 'PENDING_APPROVAL' } }),
            this.prisma.working.purchaseInvoice.count({ where: { tenantId, status: 'APPROVED' } }),
            this.prisma.working.purchaseInvoice.count({ where: { tenantId, status: 'PAID' } }),
        ]);
        const totalPayable = await this.prisma.working.purchaseInvoice.aggregate({
            where: { tenantId, status: 'APPROVED' },
            _sum: { grandTotal: true },
        });
        return {
            total, draft, pending, approved, paid,
            totalPayable: totalPayable._sum.grandTotal?.toNumber() ?? 0,
        };
    }
    async getRecentPOs(tenantId) {
        return this.prisma.working.purchaseOrder.findMany({
            where: { tenantId },
            select: {
                id: true, poNumber: true, status: true, grandTotal: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
    }
    async getPendingApprovals(tenantId) {
        const [pos, invoices] = await Promise.all([
            this.prisma.working.purchaseOrder.findMany({
                where: { tenantId, status: 'PENDING_APPROVAL' },
                select: {
                    id: true, poNumber: true, grandTotal: true, createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
                take: 10,
            }),
            this.prisma.working.purchaseInvoice.findMany({
                where: { tenantId, status: 'PENDING_APPROVAL' },
                select: {
                    id: true, ourReference: true, grandTotal: true, createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
                take: 10,
            }),
        ]);
        return {
            purchaseOrders: pos,
            invoices,
            totalCount: pos.length + invoices.length,
        };
    }
};
exports.ProcurementDashboardService = ProcurementDashboardService;
exports.ProcurementDashboardService = ProcurementDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcurementDashboardService);
//# sourceMappingURL=procurement-dashboard.service.js.map