import { IQueryHandler } from '@nestjs/cqrs';
import { GetLostReasonAnalysisQuery } from './get-lost-reason-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';
export declare class GetLostReasonAnalysisHandler implements IQueryHandler<GetLostReasonAnalysisQuery> {
    private readonly revenueAnalytics;
    private readonly logger;
    constructor(revenueAnalytics: RevenueAnalyticsService);
    execute(query: GetLostReasonAnalysisQuery): Promise<{
        total: number;
        totalLostValue: number;
        reasons: {
            reason: string;
            count: number;
            percent: number;
            value: number;
        }[];
    }>;
}
