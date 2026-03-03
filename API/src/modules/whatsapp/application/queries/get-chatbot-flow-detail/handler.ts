import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetChatbotFlowDetailQuery } from './query';

@QueryHandler(GetChatbotFlowDetailQuery)
export class GetChatbotFlowDetailHandler implements IQueryHandler<GetChatbotFlowDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetChatbotFlowDetailQuery) {
    return this.prisma.waChatbotFlow.findUniqueOrThrow({
      where: { id: query.flowId },
    });
  }
}
