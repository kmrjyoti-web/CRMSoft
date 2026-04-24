import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
    private readonly logger = new Logger(GetLeaderboardHandler.name);

  constructor(private readonly teamPerformance: TeamPerformanceService) {}

  async execute(query: GetLeaderboardQuery) {
    try {
      return this.teamPerformance.getLeaderboard({
        dateFrom: query.dateFrom, dateTo: query.dateTo,
        metric: query.metric, limit: query.limit, currentUserId: query.currentUserId,
      });
    } catch (error) {
      this.logger.error(`GetLeaderboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
