import { IQueryHandler } from '@nestjs/cqrs';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';
export declare class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
    private readonly teamPerformance;
    private readonly logger;
    constructor(teamPerformance: TeamPerformanceService);
    execute(query: GetLeaderboardQuery): Promise<{
        metric: string;
        rankings: {
            rank: number;
            userId: string;
            name: string;
            avatar: string | null;
            value: any;
            badge: string | null;
        }[];
        myRank: any;
    }>;
}
