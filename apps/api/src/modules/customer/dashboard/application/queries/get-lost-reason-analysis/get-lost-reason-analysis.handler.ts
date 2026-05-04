import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetLostReasonAnalysisQuery } from './get-lost-reason-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';

@QueryHandler(GetLostReasonAnalysisQuery)
export class GetLostReasonAnalysisHandler implements IQueryHandler<GetLostReasonAnalysisQuery> {
    private readonly logger = new Logger(GetLostReasonAnalysisHandler.name);

  constructor(private readonly revenueAnalytics: RevenueAnalyticsService) {}

  async execute(query: GetLostReasonAnalysisQuery) {
    try {
      return this.revenueAnalytics.getLostReasonAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
    } catch (error) {
      this.logger.error(`GetLostReasonAnalysisHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
