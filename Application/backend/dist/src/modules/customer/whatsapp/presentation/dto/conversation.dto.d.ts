import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class ConversationQueryDto extends PaginationDto {
    wabaId: string;
    status?: string;
    assignedToId?: string;
}
export declare class AssignConversationDto {
    assignToUserId: string;
}
export declare class LinkConversationDto {
    entityType: string;
    entityId: string;
}
