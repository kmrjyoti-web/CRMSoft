import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetConversationsQuery } from './query';

@QueryHandler(GetConversationsQuery)
export class GetConversationsHandler implements IQueryHandler<GetConversationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetConversationsQuery) {
    const where: any = { wabaId: query.wabaId };

    if (query.status) where.status = query.status;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.search) {
      where.OR = [
        { contactPhone: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
