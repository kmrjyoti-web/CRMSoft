import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFieldDefinitionDto {
  @ApiProperty({ example: 'LEAD', description: 'Entity type this field belongs to' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'custom_priority' })
  @IsString()
  @MinLength(2)
  fieldName: string;

  @ApiProperty({ example: 'Custom Priority' })
  @IsString()
  fieldLabel: string;

  @ApiProperty({ example: 'DROPDOWN', enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'JSON'] })
  @IsEnum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'JSON'])
  fieldType: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ example: ['Low', 'Medium', 'High'], description: 'Dropdown options' })
  @IsOptional()
  options?: Record<string, unknown>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
