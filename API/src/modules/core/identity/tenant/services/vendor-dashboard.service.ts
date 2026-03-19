import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class VendorDashboardService {
  private readonly logger = new Logger(VendorDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get vendor dashboard overview metrics.
   * Counts tenants by status, calculates MRR/ARR, new tenants, and churn rate.
   */
  async getOverview(days: number = 30) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Count tenants by status
    const [totalTenants, activeTenants, trialTenants, suspendedTenants] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { status: 'TRIAL' } }),
      this.prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
    ]);

    // Calculate MRR from active subscriptions
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: { select: { price: true, interval: true } } },
    });

    let mrr = 0;
    for (const sub of activeSubscriptions) {
      const price = Number(sub.plan.price);
      switch (sub.plan.interval) {
        case 'MONTHLY':
          mrr += price;
          break;
        case 'QUARTERLY':
          mrr += price / 3;
          break;
        case 'YEARLY':
          mrr += price / 12;
          break;
        default:
          mrr += price;
      }
    }

    const arr = mrr * 12;

    // New tenants in the period
    const newTenants = await this.prisma.tenant.count({
      where: { createdAt: { gte: periodStart } },
    });

    // Calculate churn rate
    // Churn = (cancelled in period / active at start of period) * 100
    const cancelledInPeriod = await this.prisma.subscription.count({
      where: {
        status: 'CANCELLED',
        cancelledAt: { gte: periodStart },
      },
    });

    const activeAtPeriodStart = await this.prisma.subscription.count({
      where: {
        createdAt: { lt: periodStart },
        OR: [
          { status: 'ACTIVE' },
          { status: 'CANCELLED', cancelledAt: { gte: periodStart } },
        ],
      },
    });

    const churnRate = activeAtPeriodStart > 0
      ? Math.round((cancelledInPeriod / activeAtPeriodStart) * 10000) / 100
      : 0;

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      newTenants,
      churnRate,
    };
  }

  /**
   * Get Monthly Recurring Revenue trend over a period.
   * Groups active subscription plan prices by month.
   */
  async getMRR(days: number = 180) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Get all subscriptions that were active during the period
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: { lte: new Date() },
        OR: [
          { status: 'ACTIVE' },
          { status: 'TRIALING' },
          { status: 'CANCELLED', cancelledAt: { gte: periodStart } },
        ],
      },
      include: { plan: { select: { price: true, interval: true } } },
    });

    // Build monthly MRR map
    const mrrByMonth: Record<string, number> = {};
    const currentDate = new Date();

    for (let d = new Date(periodStart); d <= currentDate; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toISOString().slice(0, 7);
      mrrByMonth[monthKey] = 0;
    }

    // For each month, sum prices of subscriptions active during that month
    for (const monthKey of Object.keys(mrrByMonth)) {
      const monthStart = new Date(`${monthKey}-01T00:00:00.000Z`);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      for (const sub of subscriptions) {
        const subStart = sub.createdAt;
        const subEnd = sub.cancelledAt ?? new Date('2099-12-31');

        // Check if subscription was active during this month
        if (subStart < monthEnd && subEnd >= monthStart) {
          const price = Number(sub.plan.price);
          switch (sub.plan.interval) {
            case 'MONTHLY':
              mrrByMonth[monthKey] += price;
              break;
            case 'QUARTERLY':
              mrrByMonth[monthKey] += price / 3;
              break;
            case 'YEARLY':
              mrrByMonth[monthKey] += price / 12;
              break;
            default:
              mrrByMonth[monthKey] += price;
          }
        }
      }
    }

    return Object.entries(mrrByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, mrr]) => ({
        month,
        mrr: Math.round(mrr * 100) / 100,
      }));
  }

  /**
   * Get tenant growth over a period.
   * Counts tenants created per day/week in the specified period.
   */
  async getTenantGrowth(days: number = 90) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    const tenants = await this.prisma.tenant.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const countsByDate: Record<string, number> = {};

    for (const tenant of tenants) {
      const dateKey = tenant.createdAt.toISOString().slice(0, 10);
      countsByDate[dateKey] = (countsByDate[dateKey] ?? 0) + 1;
    }

    // Fill in missing dates with 0
    const result: Array<{ date: string; count: number }> = [];
    for (let d = new Date(periodStart); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().slice(0, 10);
      result.push({ date: dateKey, count: countsByDate[dateKey] ?? 0 });
    }

    return result;
  }

  /**
   * Get distribution of active subscriptions by plan.
   * Returns plan name, code, count, and percentage.
   */
  async getPlanDistribution() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: { select: { name: true, code: true } } },
    });

    // Group by plan
    const planCounts: Record<string, { planName: string; planCode: string; count: number }> = {};

    for (const sub of subscriptions) {
      const key = sub.plan.code;
      if (!planCounts[key]) {
        planCounts[key] = {
          planName: sub.plan.name,
          planCode: sub.plan.code,
          count: 0,
        };
      }
      planCounts[key].count++;
    }

    const total = subscriptions.length;

    return Object.values(planCounts).map((entry) => ({
      planName: entry.planName,
      planCode: entry.planCode,
      count: entry.count,
      percentage: total > 0 ? Math.round((entry.count / total) * 10000) / 100 : 0,
    }));
  }

  /**
   * Get revenue by plan from TenantInvoice amounts.
   * Groups invoice totals by plan (via tenant -> subscription -> plan).
   */
  async getRevenueByPlan(days: number = 30) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Get invoices in the period with their tenant info
    const invoices = await this.prisma.tenantInvoice.findMany({
      where: {
        createdAt: { gte: periodStart },
        status: { in: ['PAID', 'PENDING'] },
      },
      select: {
        tenantId: true,
        total: true,
      },
    });

    // Get active subscriptions to map tenant -> plan
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: { plan: { select: { name: true, code: true } } },
    });

    // Build tenant -> plan mapping (use most recent active subscription)
    const tenantPlanMap: Record<string, { planName: string; planCode: string }> = {};
    for (const sub of subscriptions) {
      tenantPlanMap[sub.tenantId] = {
        planName: sub.plan.name,
        planCode: sub.plan.code,
      };
    }

    // Aggregate revenue by plan
    const revenueByPlan: Record<string, { planName: string; revenue: number; invoiceCount: number }> = {};

    for (const inv of invoices) {
      const plan = tenantPlanMap[inv.tenantId];
      if (!plan) continue;

      const key = plan.planCode;
      if (!revenueByPlan[key]) {
        revenueByPlan[key] = {
          planName: plan.planName,
          revenue: 0,
          invoiceCount: 0,
        };
      }

      revenueByPlan[key].revenue += Number(inv.total);
      revenueByPlan[key].invoiceCount++;
    }

    return Object.values(revenueByPlan).map((entry) => ({
      planName: entry.planName,
      revenue: Math.round(entry.revenue * 100) / 100,
      invoiceCount: entry.invoiceCount,
    }));
  }
}
