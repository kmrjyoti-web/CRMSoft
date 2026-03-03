import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsOptional() @IsArray()
  channels?: string[];

  @IsOptional() @IsArray()
  variables?: string[];
}

export class UpdateTemplateDto {
  @IsOptional() @IsString()
  subject?: string;

  @IsOptional() @IsString()
  body?: string;

  @IsOptional() @IsArray()
  channels?: string[];

  @IsOptional() @IsArray()
  variables?: string[];
}
