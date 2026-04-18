import { IQueryHandler } from '@nestjs/cqrs';
import { GetVelocityMetricsQuery } from './get-velocity-metrics.query';
import { RevenueAnalyticsService } from '../../../services/revenue-analytics.service';
export declare class GetVelocityMetricsHandler implements IQueryHandler<GetVelocityMetricsQuery> {
    private readonly revenueAnalytics;
    private readonly logger;
    constructor(revenueAnalytics: RevenueAnalyticsService);
    execute(query: GetVelocityMetricsQuery): Promise<{
        salesVelocity: number;
        components: {
            numberOfDeals: number;
            avgDealSize: number;
            conversionRate: number;
            avgSalesCycleDays: number;
        };
    }>;
}
