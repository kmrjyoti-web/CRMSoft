import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a scheduled report.
 * Scheduled reports are generated and emailed automatically at the specified frequency.
 */
export class CreateScheduleDto {
  /** Display name for the scheduled report */
  @ApiProperty({
    description: 'Schedule display name',
    example: 'Weekly Sales Summary',
  })
  @IsString()
  name: string;

  /** The report definition code to schedule */
  @ApiProperty({
    description: 'Report definition code',
    example: 'SALES_SUMMARY',
  })
  @IsString()
  reportCode: string;

  /** How often the report should be generated */
  @ApiProperty({
    description: 'Report generation frequency',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
  })
  @IsString()
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])
  frequency: string;

  /** Output format for the scheduled report */
  @ApiProperty({
    description: 'Export file format',
    enum: ['PDF', 'EXCEL', 'CSV'],
  })
  @IsString()
  @IsIn(['PDF', 'EXCEL', 'CSV'])
  format: string;

  /** Additional filters to apply when generating the report */
  @ApiPropertyOptional({ description: 'Report filters as key-value pairs' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  /** Email addresses to receive the generated report */
  @ApiProperty({
    description: 'Recipient email addresses',
    example: ['sales@example.com', 'manager@example.com'],
  })
  @IsArray()
  @IsString({ each: true })
  recipientEmails: string[];

  /** Day of week for WEEKLY frequency (0 = Sunday, 6 = Saturday) */
  @ApiPropertyOptional({
    description: 'Day of week (0=Sun, 6=Sat) for weekly schedules',
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  /** Day of month for MONTHLY/QUARTERLY/YEARLY frequency (1-31) */
  @ApiPropertyOptional({
    description: 'Day of month (1-31) for monthly schedules',
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  /** Time of day to generate the report (HH:mm format) */
  @ApiPropertyOptional({
    description: 'Time of day in HH:mm format',
    default: '08:00',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  timeOfDay?: string;
}
