import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetAgingAnalysisQuery } from './get-aging-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetAgingAnalysisQuery)
export class GetAgingAnalysisHandler implements IQueryHandler<GetAgingAnalysisQuery> {
    private readonly logger = new Logger(GetAgingAnalysisHandler.name);

  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetAgingAnalysisQuery) {
    try {
      return this.revenueAnalytics.getAgingAnalysis({ userId: query.userId });
    } catch (error) {
      this.logger.error(`GetAgingAnalysisHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
