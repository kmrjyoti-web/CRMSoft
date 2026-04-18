import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class RevenueAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRevenueAnalytics(params: {
        dateFrom: Date;
        dateTo: Date;
        groupBy?: string;
    }): Promise<{
        won: {
            total: number;
            count: number;
            avgDealSize: number;
            largestDeal: {
                leadNumber: string;
                value: number;
                org: string | undefined;
            } | null;
        };
        pipeline: {
            total: number;
            weighted: number;
            byStage: {
                stage: import("@prisma/working-client").$Enums.LeadStatus;
                value: number;
                weighted: number;
                count: number;
            }[];
        };
        forecast: {
            nextMonth: {
                projected: number;
                optimistic: number;
                pessimistic: number;
                confidence: string;
            };
        };
        dealSizeDistribution: {
            range: string;
            count: number;
            value: number;
        }[];
    }>;
    getLeadSourceAnalysis(params: {
        dateFrom: Date;
        dateTo: Date;
    }): Promise<{
        source: string;
        totalLeads: number;
        won: number;
        lost: number;
        active: number;
        conversionRate: number;
        revenue: number;
        avgDealSize: number;
        avgDaysToClose: number;
    }[]>;
    getLostReasonAnalysis(params: {
        dateFrom: Date;
        dateTo: Date;
    }): Promise<{
        total: number;
        totalLostValue: number;
        reasons: {
            reason: string;
            count: number;
            percent: number;
            value: number;
        }[];
    }>;
    getAgingAnalysis(params: {
        userId?: string;
    }): Promise<{
        distribution: {
            range: string;
            count: number;
            value: number;
            percent: number;
        }[];
        avgAge: number;
        staleLeads: {
            leadNumber: string;
            contactName: string;
            daysOld: number;
            value: number;
        }[];
        staleCount: number;
        staleValue: number;
    }>;
    getVelocityMetrics(params: {
        dateFrom: Date;
        dateTo: Date;
    }): Promise<{
        salesVelocity: number;
        components: {
            numberOfDeals: number;
            avgDealSize: number;
            conversionRate: number;
            avgSalesCycleDays: number;
        };
    }>;
}
