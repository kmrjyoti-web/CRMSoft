import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetConversationMessagesQuery } from './query';

@QueryHandler(GetConversationMessagesQuery)
export class GetConversationMessagesHandler implements IQueryHandler<GetConversationMessagesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetConversationMessagesQuery) {
    const where = { conversationId: query.conversationId };

    const [data, total] = await Promise.all([
      this.prisma.working.waMessage.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.waMessage.count({ where }),
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
