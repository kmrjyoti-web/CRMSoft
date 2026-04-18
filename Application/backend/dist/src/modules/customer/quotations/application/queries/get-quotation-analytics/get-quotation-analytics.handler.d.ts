import { IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationAnalyticsQuery } from './get-quotation-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';
export declare class GetQuotationAnalyticsHandler implements IQueryHandler<GetQuotationAnalyticsQuery> {
    private readonly analytics;
    private readonly logger;
    constructor(analytics: QuotationAnalyticsService);
    execute(query: GetQuotationAnalyticsQuery): Promise<{
        stages: {
            stage: string;
            count: number;
            value: number;
            dropOff: string;
        }[];
        overallConversion: string;
    } | {
        totalQuotations: number;
        totalValue: number;
        byStatus: Record<string, number>;
        conversionRate: number;
        avgDealSize: number;
        avgTimeToClose: number;
        thisMonth: {
            total: number;
            accepted: number;
        };
        lastMonth: {
            total: number;
            accepted: number;
        };
        trend: string;
    }>;
}
