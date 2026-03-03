import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationTimelineQuery } from './get-quotation-timeline.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetQuotationTimelineQuery)
export class GetQuotationTimelineHandler implements IQueryHandler<GetQuotationTimelineQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuotationTimelineQuery) {
    return this.prisma.quotationActivity.findMany({
      where: { quotationId: query.quotationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
