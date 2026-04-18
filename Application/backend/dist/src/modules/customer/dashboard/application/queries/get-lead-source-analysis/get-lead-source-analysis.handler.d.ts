import { IQueryHandler } from '@nestjs/cqrs';
import { GetLeadSourceAnalysisQuery } from './get-lead-source-analysis.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';
export declare class GetLeadSourceAnalysisHandler implements IQueryHandler<GetLeadSourceAnalysisQuery> {
    private readonly revenueAnalytics;
    private readonly logger;
    constructor(revenueAnalytics: RevenueAnalyticsService);
    execute(query: GetLeadSourceAnalysisQuery): Promise<{
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
}
