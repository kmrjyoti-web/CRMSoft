import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetVelocityMetricsQuery } from './get-velocity-metrics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetVelocityMetricsQuery)
export class GetVelocityMetricsHandler implements IQueryHandler<GetVelocityMetricsQuery> {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetVelocityMetricsQuery) {
    return this.revenueAnalytics.getVelocityMetrics({ dateFrom: query.dateFrom, dateTo: query.dateTo });
  }
}
