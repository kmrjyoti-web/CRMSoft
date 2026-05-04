import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a report bookmark.
 * Bookmarks allow users to save frequently used report configurations.
 */
export class CreateBookmarkDto {
  /** The report definition code to bookmark */
  @ApiProperty({
    description: 'Report definition code',
    example: 'LEAD_CONVERSION',
  })
  @IsString()
  reportCode: string;

  /** Display name for the bookmark */
  @ApiProperty({
    description: 'Bookmark display name',
    example: 'Monthly Lead Conversion',
  })
  @IsString()
  name: string;

  /** Saved filter configuration for this bookmark */
  @ApiPropertyOptional({ description: 'Saved filters as key-value pairs' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  /** Whether this bookmark is pinned to the dashboard */
  @ApiPropertyOptional({
    description: 'Pin bookmark to dashboard',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
