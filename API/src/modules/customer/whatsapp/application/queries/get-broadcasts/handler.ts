import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetBroadcastsQuery } from './query';

@QueryHandler(GetBroadcastsQuery)
export class GetBroadcastsHandler implements IQueryHandler<GetBroadcastsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBroadcastsQuery) {
    const where: any = { wabaId: query.wabaId };

    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.waBroadcast.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.waBroadcast.count({ where }),
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
