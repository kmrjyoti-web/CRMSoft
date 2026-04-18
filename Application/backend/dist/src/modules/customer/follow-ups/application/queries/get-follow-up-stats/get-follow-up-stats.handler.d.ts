import { IQueryHandler } from '@nestjs/cqrs';
import { GetFollowUpStatsQuery } from './get-follow-up-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetFollowUpStatsHandler implements IQueryHandler<GetFollowUpStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetFollowUpStatsQuery): Promise<{
        total: number;
        completed: number;
        overdue: number;
        pending: number;
        byPriority: {
            priority: import("@prisma/working-client").$Enums.FollowUpPriority;
            count: number;
        }[];
    }>;
}
