import { IQueryHandler } from '@nestjs/cqrs';
import { GetTourPlanStatsQuery } from './get-tour-plan-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetTourPlanStatsHandler implements IQueryHandler<GetTourPlanStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTourPlanStatsQuery): Promise<{
        total: number;
        byStatus: {
            status: import("@prisma/working-client").$Enums.TourPlanStatus;
            count: number;
        }[];
        totalVisits: number;
        completedVisits: number;
        visitCompletionRate: number;
    }>;
}
