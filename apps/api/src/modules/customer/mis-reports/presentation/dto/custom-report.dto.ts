import {
  IsString, IsOptional, IsArray, IsEnum, IsObject, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO for building a custom report on the fly. */
export class CustomReportDto {
  @ApiProperty({ description: 'Entity to query', enum: ['LEAD', 'CONTACT', 'ORGANIZATION', 'ACTIVITY', 'DEMO', 'QUOTATION', 'TOUR_PLAN'] })
  @IsString()
  entity: string;

  @ApiProperty({ description: 'Start date (ISO 8601)' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ description: 'End date (ISO 8601)' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ description: 'Columns to include' })
  @IsOptional()
  @IsArray()
  columns?: string[];

  @ApiPropertyOptional({ description: 'Additional filters on the entity' })
  @IsOptional()
  @IsObject()
  entityFilters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Field to group by' })
  @IsOptional()
  @IsString()
  groupByField?: string;

  @ApiPropertyOptional({ description: 'Aggregations to apply', type: [Object] })
  @IsOptional()
  @IsArray()
  aggregations?: Array<{ column: string; function: string }>;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortByField?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Chart type for visualization', enum: ['BAR', 'LINE', 'PIE', 'DONUT'] })
  @IsOptional()
  @IsString()
  chartType?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', default: 50 })
  @IsOptional()
  limit?: number;
}

/** DTO for saving a custom report as a bookmark. */
export class SaveCustomReportDto {
  @ApiProperty({ description: 'Bookmark name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  entity: string;

  @ApiPropertyOptional({ description: 'Columns to include' })
  @IsOptional()
  @IsArray()
  columns?: string[];

  @ApiPropertyOptional({ description: 'Entity-specific filters' })
  @IsOptional()
  @IsObject()
  entityFilters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Group by field' })
  @IsOptional()
  @IsString()
  groupByField?: string;

  @ApiPropertyOptional({ description: 'Aggregations' })
  @IsOptional()
  @IsArray()
  aggregations?: Array<{ column: string; function: string }>;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortByField?: string;

  @ApiPropertyOptional({ description: 'Sort direction' })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Chart type' })
  @IsOptional()
  @IsString()
  chartType?: string;

  @ApiPropertyOptional({ description: 'Pin to dashboard' })
  @IsOptional()
  isPinned?: boolean;
}
