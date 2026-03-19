import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
  constructor(private readonly teamPerformance: TeamPerformanceService) {}

  async execute(query: GetLeaderboardQuery) {
    return this.teamPerformance.getLeaderboard({
      dateFrom: query.dateFrom, dateTo: query.dateTo,
      metric: query.metric, limit: query.limit, currentUserId: query.currentUserId,
    });
  }
}
