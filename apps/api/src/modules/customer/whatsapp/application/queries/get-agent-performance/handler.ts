import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WaAnalyticsService } from '../../../services/wa-analytics.service';
import { GetAgentPerformanceQuery } from './query';

@QueryHandler(GetAgentPerformanceQuery)
export class GetAgentPerformanceHandler implements IQueryHandler<GetAgentPerformanceQuery> {
  constructor(private readonly waAnalytics: WaAnalyticsService) {}

  async execute(query: GetAgentPerformanceQuery) {
    return this.waAnalytics.getAgentPerformance(
      query.wabaId,
      query.dateFrom,
      query.dateTo,
    );
  }
}
