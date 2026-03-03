import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PullEntityDto {
  @ApiPropertyOptional({ description: 'Last pulled timestamp (ISO). Null for full sync.' })
  @IsOptional()
  @IsDateString()
  lastPulledAt?: string;

  @ApiPropertyOptional({ description: 'Cursor for pagination (record ID)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 500, description: 'Max records per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  limit?: number = 500;

  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  deviceId: string;
}
