import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/** Kept for backward-compat; new code should use checkResource(tenantId, string) */
export type LimitResource = string;

export interface ResourceCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';
  isChargeable: boolean;
  chargeTokens: number;
}

@Injectable()
export class LimitCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enhanced resource check using PlanLimit table.
   * Falls back to legacy Plan columns for users/contacts/leads/products
   * if no PlanLimit record exists.
   */
  async checkResource(tenantId: string, resourceKey: string): Promise<ResourceCheckResult> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: {
        plan: {
          include: { limits: { where: { resourceKey } } },
        },
      },
    });

    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, limitType: 'DISABLED', isChargeable: false, chargeTokens: 0 };
    }

    const planLimit = subscription.plan.limits[0];

    // If PlanLimit record exists, use it
    if (planLimit) {
      if (planLimit.limitType === 'DISABLED') {
        return { allowed: false, current: 0, limit: 0, limitType: 'DISABLED', isChargeable: false, chargeTokens: 0 };
      }

      if (planLimit.limitType === 'UNLIMITED') {
        return { allowed: true, current: 0, limit: -1, limitType: 'UNLIMITED', isChargeable: planLimit.isChargeable, chargeTokens: planLimit.chargeTokens };
      }

      // Get current usage from TenantUsageDetail
      const usageDetail = await this.prisma.tenantUsageDetail.findUnique({
        where: { tenantId_resourceKey: { tenantId, resourceKey } },
      });

      const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
      let current = 0;

      if (planLimit.limitType === 'MONTHLY') {
        // Monthly limit — check monthlyCount for current month
        current = usageDetail && usageDetail.monthYear === currentMonth
          ? usageDetail.monthlyCount
          : 0;
      } else {
        // TOTAL limit — check currentCount
        current = usageDetail?.currentCount ?? 0;
      }

      return {
        allowed: current < planLimit.limitValue,
        current,
        limit: planLimit.limitValue,
        limitType: planLimit.limitType as any,
        isChargeable: planLimit.isChargeable,
        chargeTokens: planLimit.chargeTokens,
      };
    }

    // Fallback: legacy Plan columns for basic resources
    const legacyMap: Record<string, string> = {
      users: 'maxUsers',
      contacts: 'maxContacts',
      leads: 'maxLeads',
      products: 'maxProducts',
    };

    const planField = legacyMap[resourceKey];
    if (!planField) {
      // No PlanLimit and no legacy column — allow by default (no restriction defined)
      return { allowed: true, current: 0, limit: -1, limitType: 'UNLIMITED', isChargeable: false, chargeTokens: 0 };
    }

    const usage = await this.prisma.tenantUsage.findUnique({ where: { tenantId } });
    const plan = subscription.plan;

    const countMap: Record<string, number> = {
      users: usage?.usersCount ?? 0,
      contacts: usage?.contactsCount ?? 0,
      leads: usage?.leadsCount ?? 0,
      products: usage?.productsCount ?? 0,
    };

    const limitMap: Record<string, number> = {
      maxUsers: plan.maxUsers,
      maxContacts: plan.maxContacts,
      maxLeads: plan.maxLeads,
      maxProducts: plan.maxProducts,
    };

    const current = countMap[resourceKey] ?? 0;
    const limit = limitMap[planField] ?? 0;

    return { allowed: current < limit, current, limit, limitType: 'TOTAL', isChargeable: false, chargeTokens: 0 };
  }

  /**
   * Backward-compatible wrapper. Use checkResource() for new code.
   */
  async canCreate(tenantId: string, resource: LimitResource): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    const result = await this.checkResource(tenantId, resource);
    return { allowed: result.allowed, current: result.current, limit: result.limit };
  }

  async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true },
    });

    if (!subscription) return false;
    return subscription.plan.features.includes(feature as any);
  }

  /**
   * Get all plan limits with current usage for a tenant.
   */
  async getAllLimitsWithUsage(tenantId: string): Promise<{
    planName: string;
    limits: Array<ResourceCheckResult & { resourceKey: string }>;
  }> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: {
        plan: { include: { limits: true } },
      },
    });

    if (!subscription) {
      return { planName: '', limits: [] };
    }

    const usageDetails = await this.prisma.tenantUsageDetail.findMany({
      where: { tenantId },
    });

    const usageMap = new Map(usageDetails.map((u) => [u.resourceKey, u]));
    const currentMonth = new Date().toISOString().slice(0, 7);

    const limits = subscription.plan.limits.map((pl) => {
      const usage = usageMap.get(pl.resourceKey);
      let current = 0;

      if (pl.limitType === 'MONTHLY') {
        current = usage && usage.monthYear === currentMonth ? usage.monthlyCount : 0;
      } else if (pl.limitType === 'TOTAL') {
        current = usage?.currentCount ?? 0;
      }

      return {
        resourceKey: pl.resourceKey,
        allowed: pl.limitType === 'DISABLED' ? false : pl.limitType === 'UNLIMITED' ? true : current < pl.limitValue,
        current,
        limit: pl.limitType === 'UNLIMITED' ? -1 : pl.limitValue,
        limitType: pl.limitType as any,
        isChargeable: pl.isChargeable,
        chargeTokens: pl.chargeTokens,
      };
    });

    return { planName: subscription.plan.name, limits };
  }
}
