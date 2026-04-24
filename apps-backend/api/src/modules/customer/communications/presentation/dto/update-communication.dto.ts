import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommunicationDto {
  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional() @IsString()
  value?: string;

  @ApiPropertyOptional({ enum: ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'] })
  @IsOptional() @IsEnum(['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'])
  priorityType?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  label?: string;
}
