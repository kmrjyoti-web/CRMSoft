import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListTenantsQuery } from './query';

@QueryHandler(ListTenantsQuery)
export class ListTenantsHandler implements IQueryHandler<ListTenantsQuery> {
  private readonly logger = new Logger(ListTenantsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListTenantsQuery) {
    this.logger.log(`Listing tenants - page: ${query.page}, limit: ${query.limit}`);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.identity.tenant.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.identity.tenant.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
