import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class NotificationQueryDto extends PaginationDto {
  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  priority?: string;
}
