import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TeamPerformanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTeamPerformance(params: {
        dateFrom: Date;
        dateTo: Date;
        roleId?: string;
    }): Promise<{
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
    getLeaderboard(params: {
        dateFrom: Date;
        dateTo: Date;
        metric: string;
        limit?: number;
        currentUserId?: string;
    }): Promise<{
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
