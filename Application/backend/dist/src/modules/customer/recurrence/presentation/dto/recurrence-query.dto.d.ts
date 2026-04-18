import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class RecurrenceQueryDto extends PaginationDto {
    createdById?: string;
    pattern?: string;
    isActive?: boolean;
}
