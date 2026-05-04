import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Lead Pipeline' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'LEAD_PIPELINE_V1' })
  @IsString()
  @MinLength(2)
  code: string;

  @ApiProperty({ example: 'LEAD' })
  @IsString()
  entityType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  configJson?: Record<string, unknown>;
}
