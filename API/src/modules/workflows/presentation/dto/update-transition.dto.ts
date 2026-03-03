import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, MinLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransitionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTO', 'SCHEDULED', 'APPROVAL'] })
  @IsOptional()
  @IsEnum(['MANUAL', 'AUTO', 'SCHEDULED', 'APPROVAL'])
  triggerType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional()
  @IsOptional()
  actions?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requiredPermission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requiredRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
