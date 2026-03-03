import { IsString, IsOptional, IsNumber, IsArray, IsInt, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarningRuleDto {
  @ApiPropertyOptional({ description: 'Policy ID (null for global rule)' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['TIME_SINCE_SYNC', 'DATA_AGE', 'PENDING_UPLOAD_COUNT', 'PENDING_UPLOAD_AGE', 'STORAGE_SIZE', 'ENTITY_SPECIFIC'] })
  @IsString()
  trigger: string;

  @ApiProperty({ description: 'Base threshold value' })
  @IsNumber()
  thresholdValue: number;

  @ApiProperty({ description: 'Threshold unit: hours, days, count, mb' })
  @IsString()
  thresholdUnit: string;

  // Level 1
  @ApiPropertyOptional({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] })
  @IsOptional()
  @IsString()
  level1Action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  level1Threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level1Message?: string;

  // Level 2
  @ApiPropertyOptional({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] })
  @IsOptional()
  @IsString()
  level2Action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  level2Threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level2Message?: string;

  @ApiPropertyOptional({ description: 'Delay in minutes for BLOCK_AFTER_DELAY' })
  @IsOptional()
  @IsInt()
  @Min(1)
  level2DelayMinutes?: number;

  // Level 3
  @ApiPropertyOptional({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] })
  @IsOptional()
  @IsString()
  level3Action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  level3Threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level3Message?: string;

  // Scope
  @ApiPropertyOptional({ description: 'Apply to specific roles (empty = all)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToRoles?: string[];

  @ApiPropertyOptional({ description: 'Apply to specific users (empty = all)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToUsers?: string[];

  @ApiPropertyOptional({ description: 'Priority (lower = evaluated first)' })
  @IsOptional()
  @IsInt()
  priority?: number;
}
