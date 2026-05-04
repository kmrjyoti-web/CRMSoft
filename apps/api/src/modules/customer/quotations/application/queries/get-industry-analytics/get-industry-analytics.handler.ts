import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetIndustryAnalyticsQuery } from './get-industry-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetIndustryAnalyticsQuery)
export class GetIndustryAnalyticsHandler implements IQueryHandler<GetIndustryAnalyticsQuery> {
    private readonly logger = new Logger(GetIndustryAnalyticsHandler.name);

  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetIndustryAnalyticsQuery) {
    try {
      return this.analytics.getIndustryAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    } catch (error) {
      this.logger.error(`GetIndustryAnalyticsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
