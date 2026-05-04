import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Template layout JSON' })
  @IsOptional()
  @IsObject()
  layout?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Data source configuration' })
  @IsOptional()
  @IsObject()
  dataSource?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Make template available to all users' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
