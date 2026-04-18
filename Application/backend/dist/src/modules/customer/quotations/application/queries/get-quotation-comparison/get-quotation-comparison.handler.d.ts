import { IQueryHandler } from '@nestjs/cqrs';
import { GetQuotationComparisonQuery } from './get-quotation-comparison.query';
import { QuotationAnalyticsService } from '../../../services/quotation-analytics.service';
export declare class GetQuotationComparisonHandler implements IQueryHandler<GetQuotationComparisonQuery> {
    private readonly analytics;
    private readonly logger;
    constructor(analytics: QuotationAnalyticsService);
    execute(query: GetQuotationComparisonQuery): Promise<{
        quotations: {
            id: string;
            quotationNo: string;
            status: import("@prisma/working-client").$Enums.QuotationStatus;
            version: number;
            totalAmount: import("@prisma/working-client/runtime/library").Decimal;
            discountType: string | null;
            discountValue: import("@prisma/working-client/runtime/library").Decimal;
            itemCount: number;
        }[];
        products: string[];
        differences: {
            pricing: {
                quotationNo: string;
                subtotal: import("@prisma/working-client/runtime/library").Decimal;
                totalAmount: import("@prisma/working-client/runtime/library").Decimal;
                totalTax: import("@prisma/working-client/runtime/library").Decimal;
            }[];
        };
    }>;
}
