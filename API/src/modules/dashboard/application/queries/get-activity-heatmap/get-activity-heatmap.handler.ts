import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetActivityHeatmapQuery } from './get-activity-heatmap.query';
import { ActivityAnalyticsService } from '../../../services/activity-analytics.service';

@QueryHandler(GetActivityHeatmapQuery)
export class GetActivityHeatmapHandler implements IQueryHandler<GetActivityHeatmapQuery> {
  constructor(private readonly activityAnalytics: ActivityAnalyticsService) {}

  async execute(query: GetActivityHeatmapQuery) {
    return this.activityAnalytics.getActivityHeatmap({
      dateFrom: query.dateFrom, dateTo: query.dateTo,
      userId: query.userId, activityType: query.activityType,
    });
  }
}
