import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetQuotationComparisonQuery } from './get-quotation-comparison.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetQuotationComparisonQuery)
export class GetQuotationComparisonHandler implements IQueryHandler<GetQuotationComparisonQuery> {
    private readonly logger = new Logger(GetQuotationComparisonHandler.name);

  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetQuotationComparisonQuery) {
    try {
      return this.analytics.compareQuotations(query.ids);
    } catch (error) {
      this.logger.error(`GetQuotationComparisonHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
