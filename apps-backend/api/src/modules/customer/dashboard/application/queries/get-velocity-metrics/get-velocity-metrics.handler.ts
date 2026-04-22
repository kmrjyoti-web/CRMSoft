import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetVelocityMetricsQuery } from './get-velocity-metrics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetVelocityMetricsQuery)
export class GetVelocityMetricsHandler implements IQueryHandler<GetVelocityMetricsQuery> {
    private readonly logger = new Logger(GetVelocityMetricsHandler.name);

  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetVelocityMetricsQuery) {
    try {
      return this.revenueAnalytics.getVelocityMetrics({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    } catch (error) {
      this.logger.error(`GetVelocityMetricsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
