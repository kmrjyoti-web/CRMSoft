import { IsString, IsOptional, IsDateString, IsNumber, IsIn } from 'class-validator';

export class UpdateDemoDto {
  @IsOptional() @IsIn(['ONLINE', 'OFFLINE'])
  mode?: string;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsNumber()
  duration?: number;

  @IsOptional() @IsString()
  meetingLink?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  notes?: string;
}
