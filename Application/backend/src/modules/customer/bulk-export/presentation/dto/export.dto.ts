import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateExportDto {
  @IsString() targetEntity: string;
  @IsOptional() @IsString() format?: string;
  @IsOptional() @IsObject() filters?: Record<string, unknown>;
  @IsOptional() @IsArray() @IsString({ each: true }) columns?: string[];
}

export class ExportQueryDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
