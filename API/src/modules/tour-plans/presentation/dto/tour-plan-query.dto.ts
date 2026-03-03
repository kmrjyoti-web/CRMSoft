import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class TourPlanQueryDto extends PaginationDto {
  @IsOptional() @IsIn(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional() @IsString()
  salesPersonId?: string;

  @IsOptional() @IsDateString()
  fromDate?: string;

  @IsOptional() @IsDateString()
  toDate?: string;
}
