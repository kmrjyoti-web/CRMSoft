import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetSubscriptionQuery } from './query';

@QueryHandler(GetSubscriptionQuery)
export class GetSubscriptionHandler implements IQueryHandler<GetSubscriptionQuery> {
  private readonly logger = new Logger(GetSubscriptionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSubscriptionQuery) {
    this.logger.log(`Fetching subscription for tenant: ${query.tenantId}`);

    const subscription = await this.prisma.identity.subscription.findFirst({
      where: {
        tenantId: query.tenantId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`No active subscription found for tenant ${query.tenantId}`);
    }

    return subscription;
  }
}
