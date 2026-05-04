import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Monthly Sales Dashboard' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Report definition code (for pre-built reports)' })
  @IsOptional()
  @IsString()
  reportCode?: string;

  @ApiProperty({ description: 'Template layout JSON (sections, theme, etc.)' })
  @IsObject()
  layout: Record<string, any>;

  @ApiPropertyOptional({ description: 'Data source configuration for custom templates' })
  @IsOptional()
  @IsObject()
  dataSource?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Make template available to all users', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
