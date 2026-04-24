import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WaAnalyticsService } from '../../../services/wa-analytics.service';
import { GetAnalyticsQuery } from './query';

@QueryHandler(GetAnalyticsQuery)
export class GetAnalyticsHandler implements IQueryHandler<GetAnalyticsQuery> {
  constructor(private readonly waAnalytics: WaAnalyticsService) {}

  async execute(query: GetAnalyticsQuery) {
    return this.waAnalytics.getOverallAnalytics(
      query.wabaId,
      query.dateFrom,
      query.dateTo,
    );
  }
}
