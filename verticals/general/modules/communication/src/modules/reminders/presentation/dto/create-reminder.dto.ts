import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  recipientId: string;

  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsOptional() @IsIn(['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP'])
  channel?: string;

  @IsOptional() @IsString()
  message?: string;
}
