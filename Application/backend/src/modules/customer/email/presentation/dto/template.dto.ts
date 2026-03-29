import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateCategory } from '@prisma/working-client';

export class CreateTemplateDto {
  @ApiProperty()
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional() @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty() @IsString()
  bodyHtml: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  variables?: any[];

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isShared?: boolean;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional() @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bodyText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  variables?: any[];

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isShared?: boolean;
}

export class TemplateQueryDto {
  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsOptional() @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isShared?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;
}

export class PreviewTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  sampleData?: Record<string, any>;
}
