import { IQueryHandler } from '@nestjs/cqrs';
import { GetTeamPerformanceQuery } from './get-team-performance.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetTeamPerformanceHandler implements IQueryHandler<GetTeamPerformanceQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTeamPerformanceQuery): Promise<{
        period: string;
        totalTargets: number;
        members: {
            userId: unknown;
            targetCount: any;
            totalTarget: unknown;
            totalAchieved: unknown;
            avgAchievement: number;
        }[];
    }>;
}
