import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListInvoicesQuery } from './query';

@QueryHandler(ListInvoicesQuery)
export class ListInvoicesHandler implements IQueryHandler<ListInvoicesQuery> {
  private readonly logger = new Logger(ListInvoicesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListInvoicesQuery) {
    this.logger.log(`Listing invoices for tenant: ${query.tenantId}`);

    const where: any = { tenantId: query.tenantId };

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.tenantInvoice.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenantInvoice.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
