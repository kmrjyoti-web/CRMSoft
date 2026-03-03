import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

/**
 * DTO for querying report export history.
 * Extends PaginationDto with optional report code and export source filters.
 */
export class QueryExportsDto extends PaginationDto {
  /** Filter exports by report definition code */
  @ApiPropertyOptional({
    description: 'Filter by report definition code',
    example: 'LEAD_CONVERSION',
  })
  @IsOptional()
  @IsString()
  reportCode?: string;

  /** Filter by export source (how the export was triggered) */
  @ApiPropertyOptional({
    description: 'Filter by export source',
    enum: ['MANUAL', 'SCHEDULED', 'API'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['MANUAL', 'SCHEDULED', 'API'])
  exportSource?: string;
}
