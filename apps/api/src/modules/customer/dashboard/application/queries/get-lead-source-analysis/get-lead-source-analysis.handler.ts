import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetLeadSourceAnalysisQuery } from './get-lead-source-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetLeadSourceAnalysisQuery)
export class GetLeadSourceAnalysisHandler implements IQueryHandler<GetLeadSourceAnalysisQuery> {
    private readonly logger = new Logger(GetLeadSourceAnalysisHandler.name);

  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetLeadSourceAnalysisQuery) {
    try {
      return this.revenueAnalytics.getLeadSourceAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    } catch (error) {
      this.logger.error(`GetLeadSourceAnalysisHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
