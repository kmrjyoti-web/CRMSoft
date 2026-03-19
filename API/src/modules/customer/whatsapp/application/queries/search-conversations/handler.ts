import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SearchConversationsQuery } from './query';

@QueryHandler(SearchConversationsQuery)
export class SearchConversationsHandler implements IQueryHandler<SearchConversationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchConversationsQuery) {
    const where: any = {
      wabaId: query.wabaId,
      OR: [
        { contactPhone: { contains: query.query, mode: 'insensitive' } },
        { contactName: { contains: query.query, mode: 'insensitive' } },
        { contactPushName: { contains: query.query, mode: 'insensitive' } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.working.waConversation.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.working.waConversation.count({ where }),
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
