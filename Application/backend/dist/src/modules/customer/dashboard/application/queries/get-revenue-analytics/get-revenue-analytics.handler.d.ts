import { IQueryHandler } from '@nestjs/cqrs';
import { GetRevenueAnalyticsQuery } from './get-revenue-analytics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';
export declare class GetRevenueAnalyticsHandler implements IQueryHandler<GetRevenueAnalyticsQuery> {
    private readonly revenueAnalytics;
    private readonly logger;
    constructor(revenueAnalytics: RevenueAnalyticsService);
    execute(query: GetRevenueAnalyticsQuery): Promise<{
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
}
