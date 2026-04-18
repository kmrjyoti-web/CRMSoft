/**
 * BaseQueryDto — extended by all module list query DTOs.
 * Extends the existing PaginationDto with isDeleted and isActive.
 */
import { PaginationDto } from '../dto/pagination.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BaseQueryDto extends PaginationDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isDeleted?: boolean = false;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export type SortOrder = 'asc' | 'desc';
