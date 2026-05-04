import { IsString, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString() name: string;
  @IsString() targetEntity: string;
  @IsArray() fieldMapping: Record<string, unknown>[];
  @IsArray() @IsString({ each: true }) expectedHeaders: string[];
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sourceSystem?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() defaultValues?: Record<string, unknown>;
  @IsOptional() @IsArray() validationRules?: Record<string, unknown>[];
  @IsOptional() @IsArray() @IsString({ each: true }) duplicateCheckFields?: string[];
  @IsOptional() @IsString() duplicateStrategy?: string;
  @IsOptional() @IsBoolean() fuzzyMatchEnabled?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) fuzzyMatchFields?: string[];
  @IsOptional() @Type(() => Number) @IsNumber() fuzzyThreshold?: number;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sourceSystem?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsArray() fieldMapping?: Record<string, unknown>[];
  @IsOptional() @IsArray() @IsString({ each: true }) expectedHeaders?: string[];
  @IsOptional() defaultValues?: Record<string, unknown>;
  @IsOptional() @IsArray() validationRules?: Record<string, unknown>[];
  @IsOptional() @IsArray() @IsString({ each: true }) duplicateCheckFields?: string[];
  @IsOptional() @IsString() duplicateStrategy?: string;
  @IsOptional() @IsBoolean() fuzzyMatchEnabled?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) fuzzyMatchFields?: string[];
  @IsOptional() @Type(() => Number) @IsNumber() fuzzyThreshold?: number;
}

export class CloneProfileDto {
  @IsString() newName: string;
}
