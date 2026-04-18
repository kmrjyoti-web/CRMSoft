import { IQueryHandler } from '@nestjs/cqrs';
import { GetAgingAnalysisQuery } from './get-aging-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';
export declare class GetAgingAnalysisHandler implements IQueryHandler<GetAgingAnalysisQuery> {
    private readonly revenueAnalytics;
    private readonly logger;
    constructor(revenueAnalytics: RevenueAnalyticsService);
    execute(query: GetAgingAnalysisQuery): Promise<{
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
}
