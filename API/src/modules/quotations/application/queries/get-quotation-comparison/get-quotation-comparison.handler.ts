import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationComparisonQuery } from './get-quotation-comparison.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetQuotationComparisonQuery)
export class GetQuotationComparisonHandler implements IQueryHandler<GetQuotationComparisonQuery> {
  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetQuotationComparisonQuery) {
    return this.analytics.compareQuotations(query.ids);
  }
}
