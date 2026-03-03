import { IsArray, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyMappingDto {
  @IsArray()
  fieldMapping: any[];

  @IsOptional() @IsArray()
  validationRules?: any[];

  @IsOptional() @IsArray() @IsString({ each: true })
  duplicateCheckFields?: string[];

  @IsOptional() @IsString()
  duplicateStrategy?: string;

  @IsOptional() @IsBoolean()
  fuzzyMatchEnabled?: boolean;

  @IsOptional() @IsArray() @IsString({ each: true })
  fuzzyMatchFields?: string[];

  @IsOptional() @Type(() => Number) @IsNumber()
  fuzzyThreshold?: number;

  @IsOptional()
  defaultValues?: any;
}
