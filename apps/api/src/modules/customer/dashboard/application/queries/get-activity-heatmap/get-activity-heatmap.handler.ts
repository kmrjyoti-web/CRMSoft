import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetActivityHeatmapQuery } from './get-activity-heatmap.query';
import { ActivityAnalyticsService } from '../../../services/activity-analytics.service';

@QueryHandler(GetActivityHeatmapQuery)
export class GetActivityHeatmapHandler implements IQueryHandler<GetActivityHeatmapQuery> {
    private readonly logger = new Logger(GetActivityHeatmapHandler.name);

  constructor(private readonly activityAnalytics: ActivityAnalyticsService) {}

  async execute(query: GetActivityHeatmapQuery) {
    try {
      return this.activityAnalytics.getActivityHeatmap({
        dateFrom: query.dateFrom, dateTo: query.dateTo,
        userId: query.userId, activityType: query.activityType,
      });
    } catch (error) {
      this.logger.error(`GetActivityHeatmapHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
