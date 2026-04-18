import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class LeadQueryDto extends PaginationDto {
    isActive?: boolean;
    status?: string;
    priority?: string;
    allocatedToId?: string;
    contactId?: string;
    organizationId?: string;
}
