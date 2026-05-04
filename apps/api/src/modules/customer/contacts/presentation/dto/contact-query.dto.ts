import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class ContactQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  designation?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by linked organization ID' })
  @IsOptional() @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
