import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsObject, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OfflineChangeDto {
  @ApiProperty({ description: 'Entity name (e.g., "Lead", "Contact")' })
  @IsString()
  entityName: string;

  @ApiPropertyOptional({ description: 'Entity ID (required for UPDATE/DELETE, null for CREATE)' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ enum: ['CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE'] })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Record data' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Values before offline edit (for UPDATE)' })
  @IsOptional()
  @IsObject()
  previousValues?: Record<string, any>;

  @ApiProperty({ description: 'When change was made offline (ISO)' })
  @IsDateString()
  clientTimestamp: string;

  @ApiProperty({ description: 'Incrementing version per record' })
  @IsInt()
  clientVersion: number;
}

export class PushChangesDto {
  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  deviceId: string;

  @ApiProperty({ type: [OfflineChangeDto], description: 'Offline changes to push' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineChangeDto)
  changes: OfflineChangeDto[];
}
