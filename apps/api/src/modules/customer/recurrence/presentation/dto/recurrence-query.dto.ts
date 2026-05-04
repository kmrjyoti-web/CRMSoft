import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class RecurrenceQueryDto extends PaginationDto {
  @IsOptional() @IsString()
  createdById?: string;

  @IsOptional() @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  pattern?: string;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isActive?: boolean;
}
