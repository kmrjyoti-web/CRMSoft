import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTenantByIdQuery } from './query';

@QueryHandler(GetTenantByIdQuery)
export class GetTenantByIdHandler implements IQueryHandler<GetTenantByIdQuery> {
  private readonly logger = new Logger(GetTenantByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTenantByIdQuery) {
    this.logger.log(`Fetching tenant by id: ${query.tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: query.tenantId },
      include: {
        subscriptions: {
          include: { plan: true },
        },
        usage: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${query.tenantId} not found`);
    }

    return tenant;
  }
}
