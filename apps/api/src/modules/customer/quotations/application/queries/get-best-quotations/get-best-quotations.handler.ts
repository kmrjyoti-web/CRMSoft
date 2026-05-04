import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetBestQuotationsQuery } from './get-best-quotations.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetBestQuotationsQuery)
export class GetBestQuotationsHandler implements IQueryHandler<GetBestQuotationsQuery> {
    private readonly logger = new Logger(GetBestQuotationsHandler.name);

  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetBestQuotationsQuery) {
    try {
      return this.analytics.getBestQuotations({ limit: query.limit });
    } catch (error) {
      this.logger.error(`GetBestQuotationsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
