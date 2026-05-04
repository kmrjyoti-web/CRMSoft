import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EventParticipantDto {
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() role?: string;
}

export class CreateScheduledEventDto {
  @IsNotEmpty() @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNotEmpty() @IsString()
  type: string;

  @IsNotEmpty() @IsDateString()
  startTime: string;

  @IsNotEmpty() @IsDateString()
  endTime: string;

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
  recurrenceConfig?: Record<string, unknown>;

  @IsOptional() @IsArray()
  reminderMinutes?: number[];

  @IsOptional() @IsString()
  entityType?: string;

  @IsOptional() @IsString()
  entityId?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EventParticipantDto)
  participants?: EventParticipantDto[];
}
