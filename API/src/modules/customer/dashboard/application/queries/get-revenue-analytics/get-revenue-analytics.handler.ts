import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRevenueAnalyticsQuery } from './get-revenue-analytics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetRevenueAnalyticsQuery)
export class GetRevenueAnalyticsHandler implements IQueryHandler<GetRevenueAnalyticsQuery> {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetRevenueAnalyticsQuery) {
    return this.revenueAnalytics.getRevenueAnalytics({
      dateFrom: query.dateFrom, dateTo: query.dateTo, groupBy: query.groupBy,
    });
  }
}
