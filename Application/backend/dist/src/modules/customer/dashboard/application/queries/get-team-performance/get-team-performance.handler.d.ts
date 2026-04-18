import { IQueryHandler } from '@nestjs/cqrs';
import { GetTeamPerformanceQuery } from './get-team-performance.query';
import { TeamPerformanceService } from '../../../services/team-performance.service';
export declare class GetTeamPerformanceHandler implements IQueryHandler<GetTeamPerformanceQuery> {
    private readonly teamPerformance;
    private readonly logger;
    constructor(teamPerformance: TeamPerformanceService);
    execute(query: GetTeamPerformanceQuery): Promise<{
        users: {
            userId: string;
            name: string;
            avatar: string | null;
            role: string;
            leads: {
                assigned: number;
                new: number;
                won: number;
                lost: number;
                active: number;
                conversionRate: number;
            };
            activities: {
                total: number;
                calls: number;
                emails: number;
                meetings: number;
                visits: number;
                avgPerDay: number;
            };
            demos: {
                scheduled: number;
                completed: number;
                noShow: number;
                cancelled: number;
                completionRate: number;
            };
            quotations: {
                created: number;
                sent: number;
                accepted: number;
                wonValue: number;
                acceptanceRate: number;
            };
            tourPlans: {
                completed: number;
            };
            revenue: {
                won: number;
            };
            performanceScore: number;
        }[];
        teamSummary: {
            totalUsers: number;
            totalLeadsWon: number;
            totalRevenue: number;
            avgConversionRate: number;
            avgPerformanceScore: number;
            topPerformer: {
                name: string;
                score: number;
            } | null;
            needsAttention: {
                name: string;
                score: number;
            } | null;
        };
    }>;
}
