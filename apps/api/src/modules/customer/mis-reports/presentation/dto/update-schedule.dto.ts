import { IsIn, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';

/**
 * DTO for updating an existing scheduled report.
 * All fields from CreateScheduleDto are optional, plus a status field
 * to pause or cancel the schedule.
 */
export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  /** Schedule status — use to pause or cancel a schedule */
  @ApiPropertyOptional({
    description: 'Schedule status',
    enum: ['ACTIVE', 'PAUSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'PAUSED', 'CANCELLED'])
  status?: string;
}
