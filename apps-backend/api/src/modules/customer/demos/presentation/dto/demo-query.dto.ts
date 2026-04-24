import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class DemoQueryDto extends PaginationDto {
  @IsOptional() @IsIn(['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status?: string;

  @IsOptional() @IsIn(['ONLINE', 'OFFLINE'])
  mode?: string;

  @IsOptional() @IsString()
  conductedById?: string;

  @IsOptional() @IsDateString()
  fromDate?: string;

  @IsOptional() @IsDateString()
  toDate?: string;
}
