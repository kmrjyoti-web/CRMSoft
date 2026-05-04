import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'MH' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'STATE', enum: ['COUNTRY', 'STATE', 'CITY', 'AREA'] })
  @IsEnum(['COUNTRY', 'STATE', 'CITY', 'AREA'])
  level: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 19.076 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
