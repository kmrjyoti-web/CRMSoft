import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetNegotiationHistoryQuery } from './get-negotiation-history.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetNegotiationHistoryQuery)
export class GetNegotiationHistoryHandler implements IQueryHandler<GetNegotiationHistoryQuery> {
    private readonly logger = new Logger(GetNegotiationHistoryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNegotiationHistoryQuery) {
    try {
      return this.prisma.working.quotationNegotiationLog.findMany({
        where: { quotationId: query.quotationId },
        orderBy: { loggedAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`GetNegotiationHistoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
