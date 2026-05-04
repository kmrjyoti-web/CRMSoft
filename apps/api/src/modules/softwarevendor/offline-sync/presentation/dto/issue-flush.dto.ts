import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueFlushDto {
  @ApiProperty({ enum: ['FULL', 'ENTITY', 'DEVICE'], description: 'Type of flush' })
  @IsString()
  flushType: string;

  @ApiPropertyOptional({ description: 'Target user ID (null = all users)' })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional({ description: 'Target device ID' })
  @IsOptional()
  @IsString()
  targetDeviceId?: string;

  @ApiPropertyOptional({ description: 'Target entity to flush (required for ENTITY type)' })
  @IsOptional()
  @IsString()
  targetEntity?: string;

  @ApiProperty({ description: 'Reason for flush' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ default: true, description: 'Re-download data after flush?' })
  @IsOptional()
  @IsBoolean()
  redownloadAfter?: boolean;
}
