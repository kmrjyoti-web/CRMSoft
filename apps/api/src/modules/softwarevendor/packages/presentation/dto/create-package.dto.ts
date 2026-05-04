import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Box of 10' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'BOX10' })
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'BOX' })
  @IsOptional()
  @IsString()
  type?: string;
}
