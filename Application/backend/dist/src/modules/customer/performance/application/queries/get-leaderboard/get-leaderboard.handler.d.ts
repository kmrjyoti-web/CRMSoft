import { IQueryHandler } from '@nestjs/cqrs';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetLeaderboardQuery): Promise<{
        rank: number;
        userId: string | null;
        roleId: string | null;
        name: string | null;
        metric: import("@prisma/working-client").$Enums.TargetMetric;
        targetValue: number;
        currentValue: number;
        achievedPercent: number;
        period: import("@prisma/working-client").$Enums.TargetPeriod;
        periodStart: Date;
        periodEnd: Date;
    }[]>;
}
