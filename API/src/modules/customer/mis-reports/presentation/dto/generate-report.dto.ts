import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for generating a report with date range, optional grouping,
 * and comparison parameters.
 */
export class GenerateReportDto {
  /** Start date of the report period (ISO 8601) */
  @ApiProperty({ description: 'Start date of the report period' })
  @IsDateString()
  dateFrom: string;

  /** End date of the report period (ISO 8601) */
  @ApiProperty({ description: 'End date of the report period' })
  @IsDateString()
  dateTo: string;

  /** Optional user ID to filter report data by a specific user */
  @ApiPropertyOptional({ description: 'Filter by specific user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  /** Grouping dimension: user, month, source, industry, city, product */
  @ApiPropertyOptional({
    description: 'Group results by dimension',
    enum: ['user', 'month', 'source', 'industry', 'city', 'product'],
  })
  @IsOptional()
  @IsString()
  groupBy?: string;

  /** Additional key-value filters to apply to the report query */
  @ApiPropertyOptional({ description: 'Additional filters as key-value pairs' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  /** Whether to include comparison with the previous period */
  @ApiPropertyOptional({
    description: 'Include comparison with previous period',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  comparePrevious?: boolean;
}
