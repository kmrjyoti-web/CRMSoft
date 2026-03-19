import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetChatbotFlowsQuery } from './query';

@QueryHandler(GetChatbotFlowsQuery)
export class GetChatbotFlowsHandler implements IQueryHandler<GetChatbotFlowsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetChatbotFlowsQuery) {
    const where: any = { wabaId: query.wabaId };

    if (query.status) where.status = query.status;

    return this.prisma.waChatbotFlow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
