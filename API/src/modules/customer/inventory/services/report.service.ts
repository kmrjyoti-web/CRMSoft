import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class InventoryReportService {
  constructor(private readonly prisma: PrismaService) {}

  async stockLedger(tenantId: string, filters: {
    productId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId };
    if (filters.productId) where.productId = filters.productId;
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    const transactions = await this.prisma.stockTransaction.findMany({
      where,
      orderBy: { transactionDate: 'asc' },
      include: { inventoryItem: true },
    });

    let runningBalance = 0;
    return transactions.map((txn) => {
      runningBalance += txn.quantity;
      return {
        id: txn.id,
        date: txn.transactionDate,
        productId: txn.productId,
        type: txn.transactionType,
        inQty: txn.quantity > 0 ? txn.quantity : 0,
        outQty: txn.quantity < 0 ? Math.abs(txn.quantity) : 0,
        balance: runningBalance,
        unitPrice: txn.unitPrice,
        totalAmount: txn.totalAmount,
        location: txn.locationId,
        remarks: txn.remarks,
      };
    });
  }

  async expiryReport(tenantId: string, days: number = 30) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const serials = await this.prisma.serialMaster.findMany({
      where: {
        tenantId,
        expiryDate: { not: null, lte: futureDate },
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      orderBy: { expiryDate: 'asc' },
      include: { inventoryItem: true },
    });

    return serials.map((s) => {
      const daysLeft = s.expiryDate
        ? Math.ceil((s.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : null;
      return {
        id: s.id,
        serialNo: s.serialNo,
        productId: s.productId,
        expiryDate: s.expiryDate,
        daysLeft,
        status: s.status,
        isExpired: daysLeft !== null && daysLeft <= 0,
        locationId: s.locationId,
        costPrice: s.costPrice,
      };
    });
  }

  async valuation(tenantId: string, filters?: { locationId?: string }) {
    const where: any = { tenantId, isActive: true };

    const items = await this.prisma.inventoryItem.findMany({ where });

    // Per-location if requested
    let summaries: any[] = [];
    if (filters?.locationId) {
      summaries = await this.prisma.stockSummary.findMany({
        where: { tenantId, locationId: filters.locationId },
        include: { inventoryItem: true },
      });
    }

    const productValuations = items.map((item) => {
      const price = Number(item.avgCostPrice ?? item.lastPurchasePrice ?? 0);
      const stock = item.currentStock;
      return {
        productId: item.productId,
        inventoryType: item.inventoryType,
        currentStock: stock,
        avgCostPrice: price,
        totalValue: price * stock,
        hsnCode: item.hsnCode,
      };
    });

    const totalValue = productValuations.reduce((sum, p) => sum + p.totalValue, 0);
    const totalStock = productValuations.reduce((sum, p) => sum + p.currentStock, 0);

    return {
      totalValue,
      totalStock,
      totalProducts: productValuations.length,
      products: productValuations,
    };
  }

  async serialTracking(tenantId: string, filters?: {
    serialNo?: string;
    productId?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.serialNo) where.serialNo = { contains: filters.serialNo, mode: 'insensitive' };
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.status) where.status = filters.status;

    const serials = await this.prisma.serialMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Get transactions for these serials
    const serialIds = serials.map((s) => s.id);
    const transactions = serialIds.length > 0
      ? await this.prisma.stockTransaction.findMany({
          where: { tenantId, serialMasterId: { in: serialIds } },
          orderBy: { transactionDate: 'asc' },
        })
      : [];

    const txnMap: Record<string, any[]> = {};
    for (const txn of transactions) {
      if (txn.serialMasterId) {
        if (!txnMap[txn.serialMasterId]) txnMap[txn.serialMasterId] = [];
        txnMap[txn.serialMasterId].push(txn);
      }
    }

    return serials.map((s) => ({
      ...s,
      lifecycle: txnMap[s.id] ?? [],
    }));
  }
}
