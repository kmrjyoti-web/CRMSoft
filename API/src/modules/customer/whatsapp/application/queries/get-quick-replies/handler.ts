import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetQuickRepliesQuery } from './query';

@QueryHandler(GetQuickRepliesQuery)
export class GetQuickRepliesHandler implements IQueryHandler<GetQuickRepliesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuickRepliesQuery) {
    const where: any = { wabaId: query.wabaId };

    if (query.category) where.category = query.category;

    return this.prisma.waQuickReply.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
