import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class TourPlanQueryDto extends PaginationDto {
    status?: string;
    salesPersonId?: string;
    fromDate?: string;
    toDate?: string;
}
