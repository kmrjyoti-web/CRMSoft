import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class RawContactQueryDto extends PaginationDto {
    isActive?: boolean;
    status?: string;
    source?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
}
