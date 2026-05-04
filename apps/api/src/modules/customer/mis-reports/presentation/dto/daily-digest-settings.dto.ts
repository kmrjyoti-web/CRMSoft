import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO for configuring daily digest email delivery. */
export class DailyDigestSettingsDto {
  @ApiProperty({ description: 'Recipient email addresses', type: [String] })
  @IsArray()
  recipientEmails: string[];

  @ApiPropertyOptional({ description: 'Recipient user IDs (internal users)', type: [String] })
  @IsOptional()
  @IsArray()
  recipientUserIds?: string[];

  @ApiPropertyOptional({ description: 'Delivery time in HH:mm format (IST)', default: '08:00' })
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @ApiPropertyOptional({ description: 'Export format for the digest', enum: ['XLSX', 'CSV', 'PDF'], default: 'PDF' })
  @IsOptional()
  @IsString()
  format?: string;
}
