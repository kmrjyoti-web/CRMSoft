import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AnalyticsQueryDto } from './dto/quotation-query.dto';
export declare class QuotationAnalyticsController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    overview(query: AnalyticsQueryDto): Promise<ApiResponse<any>>;
    conversion(query: AnalyticsQueryDto): Promise<ApiResponse<any>>;
    industry(query: AnalyticsQueryDto): Promise<ApiResponse<any>>;
    products(query: AnalyticsQueryDto): Promise<ApiResponse<any>>;
    bestQuotations(limit?: string): Promise<ApiResponse<any>>;
    comparison(ids: string): Promise<ApiResponse<any>>;
}
