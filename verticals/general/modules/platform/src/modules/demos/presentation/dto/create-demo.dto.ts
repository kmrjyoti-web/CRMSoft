import { IsString, IsOptional, IsDateString, IsNumber, IsIn } from 'class-validator';

export class CreateDemoDto {
  @IsString()
  leadId: string;

  @IsIn(['ONLINE', 'OFFLINE'])
  mode: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional() @IsNumber()
  duration?: number;

  @IsOptional() @IsString()
  meetingLink?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  notes?: string;
}
