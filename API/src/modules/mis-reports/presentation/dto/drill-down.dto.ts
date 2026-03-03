import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

/**
 * DTO for drilling down into a specific report dimension.
 * Extends PaginationDto to support paginated drill-down results.
 */
export class DrillDownDto extends PaginationDto {
  /** The dimension to drill into (e.g., status, source, userId) */
  @ApiProperty({
    description: 'Dimension to drill into',
    example: 'status',
  })
  @IsString()
  dimension: string;

  /** The specific value within the dimension to examine */
  @ApiProperty({
    description: 'The specific dimension value to drill into',
    example: 'WON',
  })
  @IsString()
  value: string;

  /** Start date of the report period (ISO 8601) */
  @ApiProperty({ description: 'Start date of the report period' })
  @IsDateString()
  dateFrom: string;

  /** End date of the report period (ISO 8601) */
  @ApiProperty({ description: 'End date of the report period' })
  @IsDateString()
  dateTo: string;

  /** Additional key-value filters to apply */
  @ApiPropertyOptional({ description: 'Additional filters as key-value pairs' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
