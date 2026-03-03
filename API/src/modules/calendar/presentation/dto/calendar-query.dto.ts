import { IsOptional, IsDateString, IsArray, IsString } from 'class-validator';

export class CalendarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  eventTypes?: string[];
}

export class TeamCalendarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray() @IsString({ each: true })
  userIds: string[];
}
