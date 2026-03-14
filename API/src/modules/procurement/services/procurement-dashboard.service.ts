import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class ProcurementDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const [
      rfqCounts,
      poCounts,
      grnCounts,
      invoiceCounts,
      recentPOs,
      pendingApprovals,
    ] = await Promise.all([
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

  private async getRFQCounts(tenantId: string) {
    const [total, draft, sent, closed] = await Promise.all([
      this.prisma.purchaseRFQ.count({ where: { tenantId } }),
      this.prisma.purchaseRFQ.count({ where: { tenantId, status: 'DRAFT' } }),
      this.prisma.purchaseRFQ.count({ where: { tenantId, status: 'SENT' } }),
      this.prisma.purchaseRFQ.count({ where: { tenantId, status: 'CLOSED' } }),
    ]);
    return { total, draft, sent, closed };
  }

  private async getPOCounts(tenantId: string) {
    const [total, draft, pendingApproval, approved, completed] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { tenantId } }),
      this.prisma.purchaseOrder.count({ where: { tenantId, status: 'DRAFT' } }),
      this.prisma.purchaseOrder.count({ where: { tenantId, status: 'PENDING_APPROVAL' } }),
      this.prisma.purchaseOrder.count({ where: { tenantId, status: 'APPROVED' } }),
      this.prisma.purchaseOrder.count({ where: { tenantId, status: 'COMPLETED' } }),
    ]);

    const totalValue = await this.prisma.purchaseOrder.aggregate({
      where: { tenantId, status: { in: ['APPROVED', 'PARTIALLY_RECEIVED', 'COMPLETED'] } },
      _sum: { grandTotal: true },
    });

    return {
      total, draft, pendingApproval, approved, completed,
      totalValue: totalValue._sum.grandTotal?.toNumber() ?? 0,
    };
  }

  private async getGRNCounts(tenantId: string) {
    const [total, draft, accepted, rejected] = await Promise.all([
      this.prisma.goodsReceipt.count({ where: { tenantId } }),
      this.prisma.goodsReceipt.count({ where: { tenantId, status: 'DRAFT' } }),
      this.prisma.goodsReceipt.count({ where: { tenantId, status: 'ACCEPTED' } }),
      this.prisma.goodsReceipt.count({ where: { tenantId, status: 'REJECTED' } }),
    ]);
    return { total, draft, accepted, rejected };
  }

  private async getInvoiceCounts(tenantId: string) {
    const [total, draft, pending, approved, paid] = await Promise.all([
      this.prisma.purchaseInvoice.count({ where: { tenantId } }),
      this.prisma.purchaseInvoice.count({ where: { tenantId, status: 'DRAFT' } }),
      this.prisma.purchaseInvoice.count({ where: { tenantId, status: 'PENDING_APPROVAL' } }),
      this.prisma.purchaseInvoice.count({ where: { tenantId, status: 'APPROVED' } }),
      this.prisma.purchaseInvoice.count({ where: { tenantId, status: 'PAID' } }),
    ]);

    const totalPayable = await this.prisma.purchaseInvoice.aggregate({
      where: { tenantId, status: 'APPROVED' },
      _sum: { grandTotal: true },
    });

    return {
      total, draft, pending, approved, paid,
      totalPayable: totalPayable._sum.grandTotal?.toNumber() ?? 0,
    };
  }

  private async getRecentPOs(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      select: {
        id: true, poNumber: true, status: true, grandTotal: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  private async getPendingApprovals(tenantId: string) {
    const [pos, invoices] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: { tenantId, status: 'PENDING_APPROVAL' },
        select: {
          id: true, poNumber: true, grandTotal: true, createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      this.prisma.purchaseInvoice.findMany({
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
}
