import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationAnalyticsQuery } from './get-quotation-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetQuotationAnalyticsQuery)
export class GetQuotationAnalyticsHandler implements IQueryHandler<GetQuotationAnalyticsQuery> {
  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetQuotationAnalyticsQuery) {
    if (query.type === 'conversion') {
      return this.analytics.getConversionFunnel({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    }
    return this.analytics.getOverview({ dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId });
  }
}
