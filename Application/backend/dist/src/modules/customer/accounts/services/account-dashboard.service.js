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
exports.AccountDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AccountDashboardService = class AccountDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(tenantId) {
        const receivables = await this.prisma.working.invoice.findMany({
            where: { tenantId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
        });
        const totalReceivable = receivables.reduce((s, i) => s + Number(i.balanceAmount), 0);
        const payables = await this.prisma.working.purchaseInvoice.findMany({
            where: { tenantId, paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
        });
        const totalPayable = payables.reduce((s, i) => s + Number(i.balanceAmount), 0);
        const cashLedger = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, code: 'CASH' } });
        const bankAccounts = await this.prisma.working.bankAccount.findMany({ where: { tenantId, isActive: true } });
        const cashBalance = Number(cashLedger?.currentBalance ?? 0);
        const bankBalance = bankAccounts.reduce((s, b) => s + Number(b.currentBalance), 0);
        const latestGST = await this.prisma.working.gSTReturn.findFirst({
            where: { tenantId, returnType: 'GSTR_3B', status: { not: 'FILED' } },
            orderBy: { period: 'desc' },
        });
        const gstDue = latestGST ? Number(latestGST.netTaxPayable ?? 0) : 0;
        const recentPayments = await this.prisma.working.paymentRecord.findMany({
            where: { tenantId },
            orderBy: { paymentDate: 'desc' },
            take: 5,
        });
        const pendingApprovals = await this.prisma.working.paymentRecord.count({
            where: { tenantId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } },
        });
        const now = new Date();
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const sales = await this.prisma.working.invoice.findMany({
                where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] }, invoiceDate: { gte: date, lte: monthEnd } },
            });
            const purchases = await this.prisma.working.purchaseInvoice.findMany({
                where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED'] }, invoiceDate: { gte: date, lte: monthEnd } },
            });
            monthlyData.push({
                month: label,
                revenue: Math.round(sales.reduce((s, i) => s + Number(i.totalAmount), 0)),
                expenses: Math.round(purchases.reduce((s, i) => s + Number(i.grandTotal), 0)),
            });
        }
        return {
            totalReceivable: Math.round(totalReceivable * 100) / 100,
            totalPayable: Math.round(totalPayable * 100) / 100,
            cashAndBank: Math.round((cashBalance + bankBalance) * 100) / 100,
            cashBalance: Math.round(cashBalance * 100) / 100,
            bankBalance: Math.round(bankBalance * 100) / 100,
            gstDue: Math.round(gstDue * 100) / 100,
            pendingApprovals,
            recentPayments,
            monthlyData,
            receivableCount: receivables.length,
            payableCount: payables.length,
        };
    }
};
exports.AccountDashboardService = AccountDashboardService;
exports.AccountDashboardService = AccountDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountDashboardService);
//# sourceMappingURL=account-dashboard.service.js.map