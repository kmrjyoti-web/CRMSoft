import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class DrillDownDto extends PaginationDto {
    dimension: string;
    value: string;
    dateFrom: string;
    dateTo: string;
    filters?: Record<string, any>;
}
