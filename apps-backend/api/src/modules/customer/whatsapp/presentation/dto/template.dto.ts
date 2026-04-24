import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../../../common/dto/pagination.dto';

export class CreateTemplateDto {
  @IsString() wabaId: string;
  @IsString() name: string;
  @IsOptional() @IsString() language?: string;
  @IsString() category: string;
  @IsOptional() @IsString() headerType?: string;
  @IsOptional() @IsString() headerContent?: string;
  @IsString() bodyText: string;
  @IsOptional() @IsString() footerText?: string;
  @IsOptional() buttons?: Record<string, unknown>;
  @IsOptional() variables?: Record<string, unknown>;
  @IsOptional() sampleValues?: Record<string, unknown>;
}

export class UpdateTemplateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsString() footerText?: string;
  @IsOptional() buttons?: Record<string, unknown>;
}

export class TemplateQueryDto extends PaginationDto {
  @IsString() wabaId: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
}
