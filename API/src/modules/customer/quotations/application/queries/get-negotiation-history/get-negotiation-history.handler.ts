import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNegotiationHistoryQuery } from './get-negotiation-history.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetNegotiationHistoryQuery)
export class GetNegotiationHistoryHandler implements IQueryHandler<GetNegotiationHistoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNegotiationHistoryQuery) {
    return this.prisma.quotationNegotiationLog.findMany({
      where: { quotationId: query.quotationId },
      orderBy: { loggedAt: 'desc' },
    });
  }
}
