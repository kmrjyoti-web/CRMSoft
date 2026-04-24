import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetQuotationAnalyticsQuery } from './get-quotation-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetQuotationAnalyticsQuery)
export class GetQuotationAnalyticsHandler implements IQueryHandler<GetQuotationAnalyticsQuery> {
    private readonly logger = new Logger(GetQuotationAnalyticsHandler.name);

  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetQuotationAnalyticsQuery) {
    try {
      if (query.type === 'conversion') {
        return this.analytics.getConversionFunnel({ dateFrom: query.dateFrom, dateTo: query.dateTo });
      }
      return this.analytics.getOverview({ dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId });
    } catch (error) {
      this.logger.error(`GetQuotationAnalyticsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
