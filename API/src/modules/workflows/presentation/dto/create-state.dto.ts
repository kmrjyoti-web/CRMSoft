import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, MinLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStateDto {
  @ApiProperty({ example: 'New' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'NEW' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({ enum: ['INITIAL', 'INTERMEDIATE', 'TERMINAL'] })
  @IsEnum(['INITIAL', 'INTERMEDIATE', 'TERMINAL'])
  stateType: string;

  @ApiPropertyOptional({ enum: ['SUCCESS', 'FAILURE', 'PAUSED'] })
  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILURE', 'PAUSED'])
  category?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}
