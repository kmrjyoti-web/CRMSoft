import { IsString, IsOptional, IsDateString, IsNumber, IsIn } from 'class-validator';

export class CreateActivityDto {
  @IsIn(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP', 'SMS', 'VISIT'])
  type: string;

  @IsString()
  subject: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsDateString()
  endTime?: string;

  @IsOptional() @IsNumber()
  duration?: number;

  @IsOptional() @IsString()
  leadId?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  locationName?: string;

  @IsOptional() @IsNumber()
  latitude?: number;

  @IsOptional() @IsNumber()
  longitude?: number;
}
