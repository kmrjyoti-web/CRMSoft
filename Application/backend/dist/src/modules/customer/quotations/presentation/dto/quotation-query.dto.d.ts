import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class QuotationQueryDto extends PaginationDto {
    status?: string;
    leadId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
}
export declare class AnalyticsQueryDto {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
}
