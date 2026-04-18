import { IQueryHandler } from '@nestjs/cqrs';
import { GetActivityStatsQuery } from './get-activity-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetActivityStatsHandler implements IQueryHandler<GetActivityStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetActivityStatsQuery): Promise<{
        total: number;
        completed: number;
        pending: number;
        completionRate: number;
        byType: {
            type: import("@prisma/working-client").$Enums.ActivityType;
            count: number;
        }[];
    }>;
}
