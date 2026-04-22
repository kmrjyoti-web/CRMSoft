import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMappingDto {
  @ApiPropertyOptional({ example: 'VP Engineering' })
  @IsOptional() @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Product' })
  @IsOptional() @IsString()
  department?: string;
}
