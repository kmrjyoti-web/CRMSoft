import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WalletAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get spend breakdown by category for a tenant or all tenants.
   */
  async getSpendByCategory(tenantId?: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      type: 'DEBIT',
      status: 'WTX_COMPLETED',
      createdAt: { gte: since },
    };
    if (tenantId) where.tenantId = tenantId;

    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      select: { serviceKey: true, tokens: true },
    });

    const byCategory: Record<string, number> = {};
    for (const txn of transactions) {
      const category = txn.serviceKey?.split('.')[0] ?? 'other';
      byCategory[category] = (byCategory[category] ?? 0) + Math.abs(txn.tokens);
    }

    return Object.entries(byCategory)
      .map(([category, tokens]) => ({ category, tokens }))
      .sort((a, b) => b.tokens - a.tokens);
  }

  /**
   * Get top services by spend.
   */
  async getTopServices(tenantId?: string, days = 30, limit = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      type: 'DEBIT',
      status: 'WTX_COMPLETED',
      createdAt: { gte: since },
    };
    if (tenantId) where.tenantId = tenantId;

    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      select: { serviceKey: true, tokens: true },
    });

    const byService: Record<string, { tokens: number; count: number }> = {};
    for (const txn of transactions) {
      const key = txn.serviceKey ?? 'unknown';
      if (!byService[key]) byService[key] = { tokens: 0, count: 0 };
      byService[key].tokens += Math.abs(txn.tokens);
      byService[key].count += 1;
    }

    return Object.entries(byService)
      .map(([serviceKey, stats]) => ({ serviceKey, ...stats }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, limit);
  }

  /**
   * Get daily spend trend.
   */
  async getDailySpendTrend(tenantId?: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      type: 'DEBIT',
      status: 'WTX_COMPLETED',
      createdAt: { gte: since },
    };
    if (tenantId) where.tenantId = tenantId;

    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      select: { tokens: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay: Record<string, number> = {};
    for (const txn of transactions) {
      const day = txn.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + Math.abs(txn.tokens);
    }

    return Object.entries(byDay)
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Platform revenue summary (super admin).
   */
  async getRevenueSummary(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalRecharge, totalSpend, activeWallets, totalWallets] = await Promise.all([
      this.prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT', status: 'WTX_COMPLETED', createdAt: { gte: since } },
        _sum: { tokens: true },
      }),
      this.prisma.walletTransaction.aggregate({
        where: { type: 'DEBIT', status: 'WTX_COMPLETED', createdAt: { gte: since } },
        _sum: { tokens: true },
      }),
      this.prisma.wallet.count({ where: { isActive: true, balance: { gt: 0 } } }),
      this.prisma.wallet.count(),
    ]);

    return {
      totalRecharged: totalRecharge._sum.tokens ?? 0,
      totalSpent: Math.abs(totalSpend._sum.tokens ?? 0),
      activeWallets,
      totalWallets,
      periodDays: days,
    };
  }
}
