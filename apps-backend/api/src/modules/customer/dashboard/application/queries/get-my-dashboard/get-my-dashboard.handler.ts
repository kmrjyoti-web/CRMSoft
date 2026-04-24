import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetMyDashboardQuery } from './get-my-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';

@QueryHandler(GetMyDashboardQuery)
export class GetMyDashboardHandler implements IQueryHandler<GetMyDashboardQuery> {
    private readonly logger = new Logger(GetMyDashboardHandler.name);

  constructor(private readonly dashboardService: DashboardAggregatorService) {}

  async execute(query: GetMyDashboardQuery) {
    try {
      return this.dashboardService.getMyDashboard(query.userId);
    } catch (error) {
      this.logger.error(`GetMyDashboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
