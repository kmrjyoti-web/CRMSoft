import { IQueryHandler } from '@nestjs/cqrs';
import { GetProductAnalyticsQuery } from './get-product-analytics.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';
export declare class GetProductAnalyticsHandler implements IQueryHandler<GetProductAnalyticsQuery> {
    private readonly analytics;
    private readonly logger;
    constructor(analytics: QuotationAnalyticsService);
    execute(query: GetProductAnalyticsQuery): Promise<{
        productId: unknown;
        productName: unknown;
        productCode: unknown;
        timesQuoted: any;
        totalQuantity: unknown;
        totalRevenue: number;
        conversionRate: number;
    }[]>;
}
