import { IsOptional, IsString, IsInt, IsBoolean, IsObject, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePolicyDto {
  @ApiPropertyOptional({ enum: ['BIDIRECTIONAL', 'DOWNLOAD_ONLY', 'UPLOAD_ONLY', 'DISABLED'] })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ description: 'Sync interval in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  syncIntervalMinutes?: number;

  @ApiPropertyOptional({ description: 'Max rows allowed offline (null = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRowsOffline?: number | null;

  @ApiPropertyOptional({ description: 'Max storage in MB for this entity' })
  @IsOptional()
  @IsInt()
  maxStorageMb?: number | null;

  @ApiPropertyOptional({ description: 'Max age of offline data in days' })
  @IsOptional()
  @IsInt()
  maxDataAgeDays?: number | null;

  @ApiPropertyOptional({ enum: ['SERVER_WINS', 'CLIENT_WINS', 'LATEST_WINS', 'MERGE_FIELDS', 'MANUAL'] })
  @IsOptional()
  @IsString()
  conflictStrategy?: string;

  @ApiPropertyOptional({ enum: ['OWNED', 'TEAM', 'ALL'], description: 'Download scope' })
  @IsOptional()
  @IsString()
  downloadScope?: string;

  @ApiPropertyOptional({ description: 'Download filter JSON' })
  @IsOptional()
  @IsObject()
  downloadFilter?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Sync priority (1=highest, 10=lowest)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  syncPriority?: number;

  @ApiPropertyOptional({ description: 'Enable or disable this entity sync' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
