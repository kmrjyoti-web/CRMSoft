import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class RawContactQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Comma-separated statuses: RAW,VERIFIED,REJECTED,DUPLICATE',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated sources: MANUAL,BULK_IMPORT,WEB_FORM,REFERRAL,API',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  createdAtTo?: string;
}
