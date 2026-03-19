import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface UpsertPlanLimitItem {
  resourceKey: string;
  limitType: 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';
  limitValue: number;
  isChargeable?: boolean;
  chargeTokens?: number;
}

@Injectable()
export class PlanLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async getByPlan(planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    return this.prisma.planLimit.findMany({
      where: { planId },
      orderBy: { resourceKey: 'asc' },
    });
  }

  async upsertLimits(planId: string, limits: UpsertPlanLimitItem[]) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const results = await Promise.all(
      limits.map((item) =>
        this.prisma.planLimit.upsert({
          where: {
            planId_resourceKey: { planId, resourceKey: item.resourceKey },
          },
          update: {
            limitType: item.limitType,
            limitValue: item.limitType === 'UNLIMITED' || item.limitType === 'DISABLED' ? 0 : item.limitValue,
            isChargeable: item.isChargeable ?? false,
            chargeTokens: item.chargeTokens ?? 0,
          },
          create: {
            planId,
            resourceKey: item.resourceKey,
            limitType: item.limitType,
            limitValue: item.limitType === 'UNLIMITED' || item.limitType === 'DISABLED' ? 0 : item.limitValue,
            isChargeable: item.isChargeable ?? false,
            chargeTokens: item.chargeTokens ?? 0,
          },
        }),
      ),
    );

    return results;
  }

  async deleteLimit(planId: string, limitId: string) {
    const limit = await this.prisma.planLimit.findFirst({
      where: { id: limitId, planId },
    });
    if (!limit) throw new NotFoundException('Plan limit not found');

    return this.prisma.planLimit.delete({ where: { id: limitId } });
  }

  async getResourceLimit(planId: string, resourceKey: string) {
    return this.prisma.planLimit.findUnique({
      where: { planId_resourceKey: { planId, resourceKey } },
    });
  }
}
