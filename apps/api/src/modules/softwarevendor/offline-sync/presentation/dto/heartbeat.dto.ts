import { IsString, IsOptional, IsInt, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HeartbeatDto {
  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({ description: 'Number of pending unsynced changes' })
  @IsOptional()
  @IsInt()
  pendingUploadCount?: number;

  @ApiPropertyOptional({ description: 'Storage used in MB' })
  @IsOptional()
  @IsNumber()
  storageUsedMb?: number;

  @ApiPropertyOptional({ description: 'Record counts per entity: { "Contact": 450, "Lead": 120 }' })
  @IsOptional()
  @IsObject()
  recordCounts?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Per-entity sync timestamps' })
  @IsOptional()
  @IsObject()
  entitySyncState?: Record<string, any>;
}
