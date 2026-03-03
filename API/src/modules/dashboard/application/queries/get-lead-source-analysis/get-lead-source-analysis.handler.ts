import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeadSourceAnalysisQuery } from './get-lead-source-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetLeadSourceAnalysisQuery)
export class GetLeadSourceAnalysisHandler implements IQueryHandler<GetLeadSourceAnalysisQuery> {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetLeadSourceAnalysisQuery) {
    return this.revenueAnalytics.getLeadSourceAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
  }
}
