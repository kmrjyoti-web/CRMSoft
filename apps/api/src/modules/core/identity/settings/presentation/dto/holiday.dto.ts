import {
  IsString, IsEnum, IsBoolean, IsOptional, IsDateString,
  IsArray, IsInt, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HolidayType } from '@prisma/working-client';

export class CreateHolidayDto {
  @IsString() name: string;
  @IsDateString() date: string;
  @IsOptional() @IsEnum(HolidayType) type?: HolidayType;
  @IsOptional() @IsBoolean() isRecurring?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) applicableStates?: string[];
  @IsOptional() @IsBoolean() isHalfDay?: boolean;
  @IsOptional() @IsString() halfDayEnd?: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateHolidayDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsEnum(HolidayType) type?: HolidayType;
  @IsOptional() @IsBoolean() isRecurring?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) applicableStates?: string[];
  @IsOptional() @IsBoolean() isHalfDay?: boolean;
  @IsOptional() @IsString() halfDayEnd?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class HolidayQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(2000) year?: number;
  @IsOptional() @IsEnum(HolidayType) type?: HolidayType;
}
