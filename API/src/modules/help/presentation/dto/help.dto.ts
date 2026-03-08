import {
  IsString, IsOptional, IsBoolean, IsInt, IsEnum,
  IsArray, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListHelpArticlesQueryDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsEnum(['DEVELOPER', 'USER'])
  @IsOptional()
  helpType?: 'DEVELOPER' | 'USER';

  @IsString()
  @IsOptional()
  moduleCode?: string;

  @IsString()
  @IsOptional()
  screenCode?: string;

  @IsString()
  @IsOptional()
  fieldCode?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ContextualHelpQueryDto {
  @IsString()
  moduleCode: string;

  @IsString()
  @IsOptional()
  screenCode?: string;

  @IsString()
  @IsOptional()
  fieldCode?: string;
}

export class CreateHelpArticleDto {
  @IsString()
  articleCode: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  summary: string;

  @IsEnum(['DEVELOPER', 'USER'])
  helpType: 'DEVELOPER' | 'USER';

  @IsString()
  @IsOptional()
  moduleCode?: string;

  @IsString()
  @IsOptional()
  screenCode?: string;

  @IsString()
  @IsOptional()
  fieldCode?: string;

  @IsOptional()
  applicableTypes?: any;

  @IsBoolean()
  @IsOptional()
  usesTerminology?: boolean;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  videoThumbnail?: string;

  @IsOptional()
  relatedArticles?: any;

  @IsOptional()
  visibleToRoles?: any;

  @IsOptional()
  tags?: any;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateHelpArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsEnum(['DEVELOPER', 'USER'])
  @IsOptional()
  helpType?: 'DEVELOPER' | 'USER';

  @IsString()
  @IsOptional()
  moduleCode?: string;

  @IsString()
  @IsOptional()
  screenCode?: string;

  @IsString()
  @IsOptional()
  fieldCode?: string;

  @IsOptional()
  applicableTypes?: any;

  @IsBoolean()
  @IsOptional()
  usesTerminology?: boolean;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  videoThumbnail?: string;

  @IsOptional()
  relatedArticles?: any;

  @IsOptional()
  visibleToRoles?: any;

  @IsOptional()
  tags?: any;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
