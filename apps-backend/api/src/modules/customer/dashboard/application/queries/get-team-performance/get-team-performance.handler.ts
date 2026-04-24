import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTeamPerformanceQuery } from './get-team-performance.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';

@QueryHandler(GetTeamPerformanceQuery)
export class GetTeamPerformanceHandler implements IQueryHandler<GetTeamPerformanceQuery> {
    private readonly logger = new Logger(GetTeamPerformanceHandler.name);

  constructor(private readonly teamPerformance: TeamPerformanceService) {}

  async execute(query: GetTeamPerformanceQuery) {
    try {
      return this.teamPerformance.getTeamPerformance({
        dateFrom: query.dateFrom, dateTo: query.dateTo, roleId: query.roleId,
      });
    } catch (error) {
      this.logger.error(`GetTeamPerformanceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
