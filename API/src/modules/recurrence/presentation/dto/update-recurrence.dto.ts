import { IsOptional, IsDateString, IsIn, IsNumber, IsArray, IsObject } from 'class-validator';

export class UpdateRecurrenceDto {
  @IsOptional() @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  pattern?: string;

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

  @IsOptional() @IsObject()
  templateData?: Record<string, any>;
}
