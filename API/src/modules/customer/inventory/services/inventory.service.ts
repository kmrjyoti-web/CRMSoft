import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── INVENTORY ITEMS ───

  async getOrCreateItem(tenantId: string, productId: string, inventoryType: string = 'SIMPLE') {
    let item = await this.prisma.inventoryItem.findUnique({
      where: { tenantId_productId: { tenantId, productId } },
    });
    if (!item) {
      item = await this.prisma.inventoryItem.create({
        data: { tenantId, productId, inventoryType: inventoryType as any },
      });
    }
    return item;
  }

  // ─── STOCK SUMMARY ───

  async getStockSummary(tenantId: string, filters: { productId?: string; locationId?: string }) {
    const where: any = { tenantId };
    if (filters.productId) where.productId = filters.productId;
    if (filters.locationId) where.locationId = filters.locationId;

    const summaries = await this.prisma.stockSummary.findMany({
      where,
      include: { inventoryItem: true },
      orderBy: { lastUpdatedAt: 'desc' },
    });
    return summaries;
  }

  async getOpeningBalance(tenantId: string, productId: string, date: Date) {
    const transactions = await this.prisma.stockTransaction.findMany({
      where: {
        tenantId,
        productId,
        transactionDate: { lt: date },
      },
      orderBy: { transactionDate: 'asc' },
    });

    let balance = 0;
    for (const txn of transactions) {
      balance += txn.quantity;
    }
    return { productId, date, openingBalance: balance };
  }

  async recalculateStock(tenantId: string, productId: string) {
    const transactions = await this.prisma.stockTransaction.findMany({
      where: { tenantId, productId },
      orderBy: { transactionDate: 'asc' },
    });

    const locationTotals: Record<string, { totalIn: number; totalOut: number }> = {};

    for (const txn of transactions) {
      if (!locationTotals[txn.locationId]) {
        locationTotals[txn.locationId] = { totalIn: 0, totalOut: 0 };
      }
      if (txn.quantity > 0) {
        locationTotals[txn.locationId].totalIn += txn.quantity;
      } else {
        locationTotals[txn.locationId].totalOut += Math.abs(txn.quantity);
      }
    }

    const item = await this.getOrCreateItem(tenantId, productId);
    let totalStock = 0;

    for (const [locationId, totals] of Object.entries(locationTotals)) {
      const currentStock = totals.totalIn - totals.totalOut;
      totalStock += currentStock;

      await this.prisma.stockSummary.upsert({
        where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
        create: {
          tenantId,
          productId,
          locationId,
          inventoryItemId: item.id,
          totalIn: totals.totalIn,
          totalOut: totals.totalOut,
          currentStock,
          lastUpdatedAt: new Date(),
        },
        update: {
          totalIn: totals.totalIn,
          totalOut: totals.totalOut,
          currentStock,
          lastUpdatedAt: new Date(),
        },
      });
    }

    await this.prisma.inventoryItem.update({
      where: { id: item.id },
      data: { currentStock: totalStock },
    });

    return { productId, totalStock, locations: Object.keys(locationTotals).length };
  }

  // ─── DASHBOARD ───

  async getDashboard(tenantId: string) {
    const [totalItems, totalSerials, lowStockItems, expiringSerials] = await Promise.all([
      this.prisma.inventoryItem.aggregate({
        where: { tenantId, isActive: true },
        _sum: { currentStock: true },
        _count: true,
      }),
      this.prisma.serialMaster.count({ where: { tenantId } }),
      this.prisma.inventoryItem.findMany({
        where: {
          tenantId,
          isActive: true,
          reorderLevel: { not: null },
        },
      }),
      this.prisma.serialMaster.count({
        where: {
          tenantId,
          status: 'AVAILABLE',
          expiryDate: {
            not: null,
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const lowStockCount = lowStockItems.filter(
      (i) => i.reorderLevel !== null && i.currentStock <= (i.reorderLevel ?? 0),
    ).length;

    // Stock valuation
    const items = await this.prisma.inventoryItem.findMany({
      where: { tenantId, isActive: true },
    });
    const totalValue = items.reduce((sum, i) => {
      const price = Number(i.avgCostPrice ?? i.lastPurchasePrice ?? 0);
      return sum + price * i.currentStock;
    }, 0);

    return {
      totalStock: totalItems._sum.currentStock ?? 0,
      totalProducts: totalItems._count,
      totalSerials,
      stockValue: totalValue,
      expiringSoon: expiringSerials,
      lowStockAlerts: lowStockCount,
    };
  }
}
