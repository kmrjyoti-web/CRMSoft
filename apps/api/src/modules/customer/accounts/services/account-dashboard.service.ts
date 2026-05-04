import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AccountDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    // Receivables (unpaid sale invoices)
    const receivables = await this.prisma.working.invoice.findMany({
      where: { tenantId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
    });
    const totalReceivable = receivables.reduce((s, i) => s + Number(i.balanceAmount), 0);

    // Payables (unpaid purchase invoices)
    const payables = await this.prisma.working.purchaseInvoice.findMany({
      where: { tenantId, paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
    });
    const totalPayable = payables.reduce((s, i) => s + Number(i.balanceAmount), 0);

    // Cash + Bank
    const cashLedger = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, code: 'CASH' } });
    const bankAccounts = await this.prisma.working.bankAccount.findMany({ where: { tenantId, isActive: true } });
    const cashBalance = Number(cashLedger?.currentBalance ?? 0);
    const bankBalance = bankAccounts.reduce((s, b) => s + Number(b.currentBalance), 0);

    // GST Due (latest GSTR-3B)
    const latestGST = await this.prisma.working.gSTReturn.findFirst({
      where: { tenantId, returnType: 'GSTR_3B', status: { not: 'FILED' } },
      orderBy: { period: 'desc' },
    });
    const gstDue = latestGST ? Number(latestGST.netTaxPayable ?? 0) : 0;

    // Recent payments
    const recentPayments = await this.prisma.working.paymentRecord.findMany({
      where: { tenantId },
      orderBy: { paymentDate: 'desc' },
      take: 5,
    });

    // Pending approvals
    const pendingApprovals = await this.prisma.working.paymentRecord.count({
      where: { tenantId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } },
    });

    // Monthly revenue vs expenses (last 6 months)
    const now = new Date();
    const monthlyData: Array<{ month: string; revenue: number; expenses: number }> = [];
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
}
