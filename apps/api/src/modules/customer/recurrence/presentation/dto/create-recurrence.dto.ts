import { IsString, IsOptional, IsDateString, IsIn, IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateRecurrenceDto {
  @IsString()
  entityType: string;

  @IsOptional() @IsString()
  entityId?: string;

  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  pattern: string;

  @IsDateString()
  startDate: string;

  @IsObject()
  templateData: Record<string, any>;

  @IsOptional() @IsNumber()
  interval?: number;

  @IsOptional() @IsArray()
  daysOfWeek?: number[];

  @IsOptional() @IsNumber()
  dayOfMonth?: number;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsNumber()
  maxOccurrences?: number;
}
