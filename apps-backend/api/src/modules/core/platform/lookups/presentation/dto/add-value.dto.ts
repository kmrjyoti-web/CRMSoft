import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddValueDto {
  @ApiProperty({ example: 'IT_SOFTWARE' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'IT / Software' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ example: '💻' }) @IsOptional() @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#3B82F6' }) @IsOptional() @IsString()
  color?: string;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Parent value ID for hierarchical lookups' })
  @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'JSON config' }) @IsOptional()
  configJson?: Record<string, unknown>;
}
