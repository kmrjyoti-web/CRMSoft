import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ConversationQueryDto extends PaginationDto {
  @IsString() wabaId: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() assignedToId?: string;
}

export class AssignConversationDto {
  @IsString() assignToUserId: string;
}

export class LinkConversationDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
}
