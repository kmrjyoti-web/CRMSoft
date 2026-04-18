import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class ActivityQueryDto extends PaginationDto {
    isActive?: boolean;
    type?: string;
    leadId?: string;
    contactId?: string;
    createdById?: string;
    fromDate?: string;
    toDate?: string;
}
