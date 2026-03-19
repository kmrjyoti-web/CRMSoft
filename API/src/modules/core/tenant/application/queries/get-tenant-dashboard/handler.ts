import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTenantDashboardQuery } from './query';

@QueryHandler(GetTenantDashboardQuery)
export class GetTenantDashboardHandler implements IQueryHandler<GetTenantDashboardQuery> {
  private readonly logger = new Logger(GetTenantDashboardHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTenantDashboardQuery) {
    this.logger.log(`Fetching dashboard for tenant: ${query.tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: query.tenantId },
      include: {
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING'] } },
          include: { plan: true },
          take: 1,
        },
        usage: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${query.tenantId} not found`);
    }

    const subscription = tenant.subscriptions[0] ?? null;
    const plan = subscription?.plan ?? null;
    const usage = tenant.usage;

    return {
      tenant: {
        name: tenant.name,
        status: tenant.status,
        onboardingStep: tenant.onboardingStep,
      },
      plan: plan
        ? {
            name: plan.name,
            code: plan.code,
          }
        : null,
      usage: usage
        ? {
            usersCount: usage.usersCount,
            contactsCount: usage.contactsCount,
            leadsCount: usage.leadsCount,
            productsCount: usage.productsCount,
          }
        : null,
      limits: plan
        ? {
            maxUsers: plan.maxUsers,
            maxContacts: plan.maxContacts,
            maxLeads: plan.maxLeads,
            maxProducts: plan.maxProducts,
          }
        : null,
    };
  }
}
