import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { BOMCalculationService } from './bom-calculation.service';

@Injectable()
export class BOMReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculationService: BOMCalculationService,
  ) {}

  async productionReport(tenantId: string, filters?: {
    startDate?: string;
    endDate?: string;
    formulaId?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.formulaId) where.formulaId = filters.formulaId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.productionDate = {};
      if (filters?.startDate) where.productionDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.productionDate.lte = new Date(filters.endDate);
    }

    const productions = await this.prisma.working.bOMProduction.findMany({
      where,
      include: { formula: { include: { finishedProduct: true } } },
      orderBy: { productionDate: 'desc' },
    });

    const totalProduced = productions.reduce((s, p) => s + p.quantityProduced, 0);
    const totalOrdered = productions.reduce((s, p) => s + p.quantityOrdered, 0);
    const totalScrap = productions.reduce((s, p) => s + p.scrapQuantity, 0);

    return {
      runs: productions,
      summary: {
        totalRuns: productions.length,
        totalOrdered,
        totalProduced,
        totalScrap,
        completedRuns: productions.filter((p) => p.status === 'COMPLETED').length,
        cancelledRuns: productions.filter((p) => p.status === 'CANCELLED').length,
        yieldRate: totalOrdered > 0 ? Math.round((totalProduced / totalOrdered) * 10000) / 100 : 0,
      },
    };
  }

  async consumptionReport(tenantId: string, filters?: {
    startDate?: string;
    endDate?: string;
    productId?: string;
  }) {
    const where: any = {
      tenantId,
      transactionType: 'PRODUCTION_OUT',
    };
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters?.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    const transactions = await this.prisma.working.stockTransaction.findMany({
      where,
      include: { inventoryItem: true },
      orderBy: { transactionDate: 'desc' },
    });

    // Group by product
    const byProduct: Record<string, { productId: string; totalConsumed: number; totalCost: number; count: number }> = {};
    for (const txn of transactions) {
      const pid = txn.productId;
      if (!byProduct[pid]) byProduct[pid] = { productId: pid, totalConsumed: 0, totalCost: 0, count: 0 };
      byProduct[pid].totalConsumed += Math.abs(txn.quantity);
      byProduct[pid].totalCost += Number(txn.totalAmount ?? 0);
      byProduct[pid].count++;
    }

    return {
      transactions,
      summary: Object.values(byProduct).sort((a, b) => b.totalConsumed - a.totalConsumed),
    };
  }

  async costingReport(tenantId: string, formulaId: string) {
    return this.calculationService.calculateCost(tenantId, formulaId, 1);
  }

  async yieldReport(tenantId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId, status: 'COMPLETED' };
    if (filters?.startDate || filters?.endDate) {
      where.productionDate = {};
      if (filters?.startDate) where.productionDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.productionDate.lte = new Date(filters.endDate);
    }

    const productions = await this.prisma.working.bOMProduction.findMany({
      where,
      include: { formula: true },
      orderBy: { productionDate: 'desc' },
    });

    const yieldData = productions.map((p) => ({
      id: p.id,
      formulaName: p.formula.formulaName,
      ordered: p.quantityOrdered,
      produced: p.quantityProduced,
      scrap: p.scrapQuantity,
      yieldRate: p.quantityOrdered > 0
        ? Math.round((p.quantityProduced / p.quantityOrdered) * 10000) / 100
        : 0,
      date: p.productionDate,
    }));

    const avgYield = yieldData.length > 0
      ? Math.round(yieldData.reduce((s, y) => s + y.yieldRate, 0) / yieldData.length * 100) / 100
      : 0;

    return { runs: yieldData, averageYieldRate: avgYield };
  }
}
