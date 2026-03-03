import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetIndustryAnalyticsQuery } from './get-industry-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetIndustryAnalyticsQuery)
export class GetIndustryAnalyticsHandler implements IQueryHandler<GetIndustryAnalyticsQuery> {
  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetIndustryAnalyticsQuery) {
    return this.analytics.getIndustryAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
  }
}
