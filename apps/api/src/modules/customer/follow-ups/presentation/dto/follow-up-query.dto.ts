import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class FollowUpQueryDto extends PaginationDto {
  @IsOptional() @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional() @IsString()
  assignedToId?: string;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isOverdue?: boolean;

  @IsOptional() @IsString()
  entityType?: string;

  @IsOptional() @IsString()
  entityId?: string;
}
