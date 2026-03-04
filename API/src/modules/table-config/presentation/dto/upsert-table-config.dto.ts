import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertTableConfigDto {
  @ApiProperty({ example: { columns: [], density: 'compact' } })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ example: false, description: 'Apply as tenant-wide default (admin only)' })
  @IsOptional()
  @IsBoolean()
  applyToAll?: boolean;
}
