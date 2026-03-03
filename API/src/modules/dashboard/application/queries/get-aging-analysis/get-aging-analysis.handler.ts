import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAgingAnalysisQuery } from './get-aging-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetAgingAnalysisQuery)
export class GetAgingAnalysisHandler implements IQueryHandler<GetAgingAnalysisQuery> {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetAgingAnalysisQuery) {
    return this.revenueAnalytics.getAgingAnalysis({ userId: query.userId });
  }
}
