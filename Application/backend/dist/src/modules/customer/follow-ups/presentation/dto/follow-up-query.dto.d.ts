import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class FollowUpQueryDto extends PaginationDto {
    priority?: string;
    assignedToId?: string;
    isOverdue?: boolean;
    entityType?: string;
    entityId?: string;
}
