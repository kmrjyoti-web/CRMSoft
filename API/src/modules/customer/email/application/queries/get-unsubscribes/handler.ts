import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetUnsubscribesQuery } from './query';

@QueryHandler(GetUnsubscribesQuery)
export class GetUnsubscribesHandler implements IQueryHandler<GetUnsubscribesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUnsubscribesQuery) {
    const where = {};

    const [data, total] = await Promise.all([
      this.prisma.working.emailUnsubscribe.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { unsubscribedAt: 'desc' },
      }),
      this.prisma.working.emailUnsubscribe.count({ where }),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
