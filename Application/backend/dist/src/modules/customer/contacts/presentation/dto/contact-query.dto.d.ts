import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class ContactQueryDto extends PaginationDto {
    designation?: string;
    department?: string;
    organizationId?: string;
    isActive?: boolean;
}
