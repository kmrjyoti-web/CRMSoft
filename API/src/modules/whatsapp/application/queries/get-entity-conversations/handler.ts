import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetEntityConversationsQuery } from './query';

@QueryHandler(GetEntityConversationsQuery)
export class GetEntityConversationsHandler implements IQueryHandler<GetEntityConversationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntityConversationsQuery) {
    const where = {
      linkedEntityType: query.entityType,
      linkedEntityId: query.entityId,
    };

    const [data, total] = await Promise.all([
      this.prisma.waConversation.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.waConversation.count({ where }),
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
