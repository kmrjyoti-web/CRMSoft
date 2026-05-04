import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

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
    const subscription = await this.prisma.identity.subscription.findFirst({
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
      const usageDetail = await this.prisma.platform.tenantUsageDetail.findUnique({
        where: { tenantId_resourceKey: { tenantId, resourceKey } },
      });

      const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
      let current = 0;

      if (planLimit.limitType === 'MONTHLY') {
