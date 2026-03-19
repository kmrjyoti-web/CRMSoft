import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLostReasonAnalysisQuery } from './get-lost-reason-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetLostReasonAnalysisQuery)
export class GetLostReasonAnalysisHandler implements IQueryHandler<GetLostReasonAnalysisQuery> {
  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetLostReasonAnalysisQuery) {
    return this.revenueAnalytics.getLostReasonAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
  }
}
