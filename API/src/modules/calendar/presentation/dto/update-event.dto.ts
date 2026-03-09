import { IsOptional, IsString, IsBoolean, IsArray, IsDateString } from 'class-validator';

export class UpdateScheduledEventDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsDateString()
  startTime?: string;

  @IsOptional() @IsDateString()
  endTime?: string;

  @IsOptional() @IsBoolean()
  allDay?: boolean;

  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  meetingLink?: string;

  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsString()
  recurrencePattern?: string;

  @IsOptional()
  recurrenceConfig?: any;

  @IsOptional() @IsArray()
  reminderMinutes?: number[];

  @IsOptional() @IsString()
  entityType?: string;

  @IsOptional() @IsString()
  entityId?: string;
}
