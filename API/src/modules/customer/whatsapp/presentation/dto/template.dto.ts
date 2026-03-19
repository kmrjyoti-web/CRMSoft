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
  @IsOptional() buttons?: any;
  @IsOptional() variables?: any;
  @IsOptional() sampleValues?: any;
}

export class UpdateTemplateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsString() footerText?: string;
  @IsOptional() buttons?: any;
}

export class TemplateQueryDto extends PaginationDto {
  @IsString() wabaId: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
}
