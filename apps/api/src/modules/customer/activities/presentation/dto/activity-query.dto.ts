import { IsOptional, IsString, IsIn, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class ActivityQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsIn(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP', 'SMS', 'VISIT'])
  type?: string;

  @IsOptional() @IsString()
  leadId?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  createdById?: string;

  @IsOptional() @IsDateString()
  fromDate?: string;

  @IsOptional() @IsDateString()
  toDate?: string;
}
