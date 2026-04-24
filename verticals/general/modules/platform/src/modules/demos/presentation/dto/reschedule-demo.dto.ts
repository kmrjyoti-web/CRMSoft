import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RescheduleDemoDto {
  @IsDateString()
  scheduledAt: string;

  @IsOptional() @IsString()
  reason?: string;
}
