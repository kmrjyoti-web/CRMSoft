import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export type LimitResource = 'users' | 'contacts' | 'leads' | 'products';

@Injectable()
export class LimitCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  async canCreate(tenantId: string, resource: LimitResource): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    const [usage, subscription] = await Promise.all([
      this.prisma.tenantUsage.findUnique({ where: { tenantId } }),
      this.prisma.subscription.findFirst({
        where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
        include: { plan: true },
      }),
    ]);

    if (!subscription || !usage) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const plan = subscription.plan;
    const limitMap: Record<LimitResource, { current: number; limit: number }> = {
      users: { current: usage.usersCount, limit: plan.maxUsers },
      contacts: { current: usage.contactsCount, limit: plan.maxContacts },
      leads: { current: usage.leadsCount, limit: plan.maxLeads },
      products: { current: usage.productsCount, limit: plan.maxProducts },
    };

    const { current, limit } = limitMap[resource];
    return { allowed: current < limit, current, limit };
  }

  async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true },
    });

    if (!subscription) return false;
    return subscription.plan.features.includes(feature as any);
  }
}
