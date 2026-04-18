import { IQueryHandler } from '@nestjs/cqrs';
import { GetIndustryAnalyticsQuery } from './get-industry-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';
export declare class GetIndustryAnalyticsHandler implements IQueryHandler<GetIndustryAnalyticsQuery> {
    private readonly analytics;
    private readonly logger;
    constructor(analytics: QuotationAnalyticsService);
    execute(query: GetIndustryAnalyticsQuery): Promise<{
        industry: string;
        totalQuotations: number;
        accepted: number;
        rejected: number;
        pending: number;
        conversionRate: number;
        totalValue: unknown;
        avgDealSize: number;
    }[]>;
}
