import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetExecutiveDashboardQuery } from './get-executive-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';

@QueryHandler(GetExecutiveDashboardQuery)
export class GetExecutiveDashboardHandler implements IQueryHandler<GetExecutiveDashboardQuery> {
    private readonly logger = new Logger(GetExecutiveDashboardHandler.name);

  constructor(private readonly dashboardService: DashboardAggregatorService) {}

  async execute(query: GetExecutiveDashboardQuery) {
    try {
      return this.dashboardService.getExecutiveDashboard({
        dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
      });
    } catch (error) {
      this.logger.error(`GetExecutiveDashboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
