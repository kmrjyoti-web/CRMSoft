import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetQuotationTimelineQuery } from './get-quotation-timeline.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetQuotationTimelineQuery)
export class GetQuotationTimelineHandler implements IQueryHandler<GetQuotationTimelineQuery> {
    private readonly logger = new Logger(GetQuotationTimelineHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuotationTimelineQuery) {
    try {
      return this.prisma.working.quotationActivity.findMany({
        where: { quotationId: query.quotationId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`GetQuotationTimelineHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
