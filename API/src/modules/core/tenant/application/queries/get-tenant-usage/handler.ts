import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTenantUsageQuery } from './query';

@QueryHandler(GetTenantUsageQuery)
export class GetTenantUsageHandler implements IQueryHandler<GetTenantUsageQuery> {
  private readonly logger = new Logger(GetTenantUsageHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTenantUsageQuery) {
    this.logger.log(`Fetching usage for tenant: ${query.tenantId}`);

    const usage = await this.prisma.tenantUsage.findUnique({
      where: { tenantId: query.tenantId },
    });

    if (!usage) {
      throw new NotFoundException(`Usage record not found for tenant ${query.tenantId}`);
    }

    return usage;
  }
}
