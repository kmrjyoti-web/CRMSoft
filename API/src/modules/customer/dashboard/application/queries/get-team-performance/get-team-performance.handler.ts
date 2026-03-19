import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTeamPerformanceQuery } from './get-team-performance.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';

@QueryHandler(GetTeamPerformanceQuery)
export class GetTeamPerformanceHandler implements IQueryHandler<GetTeamPerformanceQuery> {
  constructor(private readonly teamPerformance: TeamPerformanceService) {}

  async execute(query: GetTeamPerformanceQuery) {
    return this.teamPerformance.getTeamPerformance({
      dateFrom: query.dateFrom, dateTo: query.dateTo, roleId: query.roleId,
    });
  }
}
