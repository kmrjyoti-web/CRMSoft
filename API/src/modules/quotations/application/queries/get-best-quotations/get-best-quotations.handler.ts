import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBestQuotationsQuery } from './get-best-quotations.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';

@QueryHandler(GetBestQuotationsQuery)
export class GetBestQuotationsHandler implements IQueryHandler<GetBestQuotationsQuery> {
  constructor(private readonly analytics: QuotationAnalyticsService) {}

  async execute(query: GetBestQuotationsQuery) {
    return this.analytics.getBestQuotations({ limit: query.limit });
  }
}
