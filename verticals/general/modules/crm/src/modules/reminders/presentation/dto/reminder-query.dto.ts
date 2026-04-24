import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class ReminderQueryDto extends PaginationDto {
  @IsOptional() @IsString()
  recipientId?: string;

  @IsOptional() @IsIn(['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'])
  channel?: string;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isSent?: boolean;
}
