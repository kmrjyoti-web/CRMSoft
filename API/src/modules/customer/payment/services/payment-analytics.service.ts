import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class PaymentAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get payment collection summary for a tenant */
  async getCollectionSummary(tenantId: string, fromDate?: string, toDate?: string) {
    const where: any = { tenantId, status: { in: ['CAPTURED', 'PAID'] } };
    if (fromDate || toDate) {
      where.paidAt = {};
      if (fromDate) where.paidAt.gte = new Date(fromDate);
      if (toDate) where.paidAt.lte = new Date(toDate);
    }

    const [totalCollected, byMethod, byGateway] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.groupBy({
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

  /** Get outstanding invoices summary */
  async getOutstandingSummary(tenantId: string) {
    const [overdue, partiallyPaid, sent] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'OVERDUE' },
        _sum: { balanceAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'PARTIALLY_PAID' },
        _sum: { balanceAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'SENT' },
        _sum: { balanceAmount: true },
        _count: true,
      }),
    ]);

    return {
      overdue: { count: overdue._count, amount: Number(overdue._sum.balanceAmount || 0) },
      partiallyPaid: { count: partiallyPaid._count, amount: Number(partiallyPaid._sum.balanceAmount || 0) },
      pending: { count: sent._count, amount: Number(sent._sum.balanceAmount || 0) },
      totalOutstanding:
        Number(overdue._sum.balanceAmount || 0) +
        Number(partiallyPaid._sum.balanceAmount || 0) +
        Number(sent._sum.balanceAmount || 0),
    };
  }

  /** Get refund summary */
  async getRefundSummary(tenantId: string) {
    const [total, byStatus] = await Promise.all([
      this.prisma.refund.aggregate({
        where: { tenantId },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.refund.groupBy({
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
}
