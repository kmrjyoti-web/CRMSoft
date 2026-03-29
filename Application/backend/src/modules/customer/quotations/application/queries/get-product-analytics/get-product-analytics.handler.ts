import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetProductAnalyticsQuery } from './get-product-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetProductAnalyticsQuery)
export class GetProductAnalyticsHandler implements IQueryHandler<GetProductAnalyticsQuery> {
  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetProductAnalyticsQuery) {
    return this.analytics.getProductAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
  }
}
