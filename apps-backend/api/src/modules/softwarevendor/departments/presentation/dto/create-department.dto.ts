import { IsString, IsOptional, IsInt, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Sales' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Sales Department' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'SALES' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Handles all sales operations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  level?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  headUserId?: string;
}
