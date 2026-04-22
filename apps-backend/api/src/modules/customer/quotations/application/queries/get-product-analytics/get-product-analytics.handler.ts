import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetProductAnalyticsQuery } from './get-product-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetProductAnalyticsQuery)
export class GetProductAnalyticsHandler implements IQueryHandler<GetProductAnalyticsQuery> {
    private readonly logger = new Logger(GetProductAnalyticsHandler.name);

  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetProductAnalyticsQuery) {
    try {
      return this.analytics.getProductAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    } catch (error) {
      this.logger.error(`GetProductAnalyticsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
