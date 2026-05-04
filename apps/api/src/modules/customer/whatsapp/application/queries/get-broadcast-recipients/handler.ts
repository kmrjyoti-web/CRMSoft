import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetBroadcastRecipientsQuery } from './query';

@QueryHandler(GetBroadcastRecipientsQuery)
export class GetBroadcastRecipientsHandler implements IQueryHandler<GetBroadcastRecipientsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBroadcastRecipientsQuery) {
    const where: any = { broadcastId: query.broadcastId };

    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.working.waBroadcastRecipient.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.waBroadcastRecipient.count({ where }),
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
