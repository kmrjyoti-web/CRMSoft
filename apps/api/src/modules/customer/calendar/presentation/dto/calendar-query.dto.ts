import { IsOptional, IsDateString, IsArray, IsString } from 'class-validator';

export class CalendarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  eventTypes?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  sources?: string[];

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  view?: string;
}

export class TeamCalendarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray() @IsString({ each: true })
  userIds: string[];
}

export class UnifiedCalendarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  sources?: string[];

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  view?: string;

  @IsOptional() @IsString()
  search?: string;
}
