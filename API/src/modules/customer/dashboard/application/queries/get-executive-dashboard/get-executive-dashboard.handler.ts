import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetExecutiveDashboardQuery } from './get-executive-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';

@QueryHandler(GetExecutiveDashboardQuery)
export class GetExecutiveDashboardHandler implements IQueryHandler<GetExecutiveDashboardQuery> {
  constructor(private readonly dashboardService: DashboardAggregatorService) {}

  async execute(query: GetExecutiveDashboardQuery) {
    return this.dashboardService.getExecutiveDashboard({
      dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
    });
  }
}
