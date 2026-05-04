import {
  IsEnum, IsBoolean, IsOptional, IsString, IsArray,
  ValidateNested, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/working-client';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateBusinessHoursDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsBoolean()
  isWorkingDay: boolean;

  @IsOptional() @IsString() @Matches(TIME_REGEX) startTime?: string;
  @IsOptional() @IsString() @Matches(TIME_REGEX) endTime?: string;
  @IsOptional() @IsString() @Matches(TIME_REGEX) breakStartTime?: string;
  @IsOptional() @IsString() @Matches(TIME_REGEX) breakEndTime?: string;
  @IsOptional() @IsString() @Matches(TIME_REGEX) shift2StartTime?: string;
  @IsOptional() @IsString() @Matches(TIME_REGEX) shift2EndTime?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateWeekScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBusinessHoursDto)
  schedules: UpdateBusinessHoursDto[];
}
