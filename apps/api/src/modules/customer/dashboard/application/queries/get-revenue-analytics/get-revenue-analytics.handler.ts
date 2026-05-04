import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetRevenueAnalyticsQuery } from './get-revenue-analytics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetRevenueAnalyticsQuery)
export class GetRevenueAnalyticsHandler implements IQueryHandler<GetRevenueAnalyticsQuery> {
    private readonly logger = new Logger(GetRevenueAnalyticsHandler.name);

  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetRevenueAnalyticsQuery) {
    try {
      return this.revenueAnalytics.getRevenueAnalytics({
        dateFrom: query.dateFrom, dateTo: query.dateTo, groupBy: query.groupBy,
      });
    } catch (error) {
      this.logger.error(`GetRevenueAnalyticsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
