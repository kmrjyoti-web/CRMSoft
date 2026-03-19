import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetConversationDetailQuery } from './query';

@QueryHandler(GetConversationDetailQuery)
export class GetConversationDetailHandler implements IQueryHandler<GetConversationDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetConversationDetailQuery) {
    return this.prisma.waConversation.findUniqueOrThrow({
      where: { id: query.conversationId },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
