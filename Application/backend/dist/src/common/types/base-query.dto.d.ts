import { PaginationDto } from '../dto/pagination.dto';
export declare class BaseQueryDto extends PaginationDto {
    isDeleted?: boolean;
    isActive?: boolean;
}
export type SortOrder = 'asc' | 'desc';
