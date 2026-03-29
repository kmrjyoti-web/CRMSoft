import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyDashboardQuery } from './get-my-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';

@QueryHandler(GetMyDashboardQuery)
export class GetMyDashboardHandler implements IQueryHandler<GetMyDashboardQuery> {
  constructor(private readonly dashboardService: DashboardAggregatorService) {}

  async execute(query: GetMyDashboardQuery) {
    return this.dashboardService.getMyDashboard(query.userId);
  }
}
