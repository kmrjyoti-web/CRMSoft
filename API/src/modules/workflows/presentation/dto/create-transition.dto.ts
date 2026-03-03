import { IsString, IsOptional, IsEnum, IsInt, IsUUID, MinLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransitionDto {
  @ApiProperty()
  @IsUUID()
  fromStateId: string;

  @ApiProperty()
  @IsUUID()
  toStateId: string;

  @ApiProperty({ example: 'Verify Lead' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'VERIFY' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTO', 'SCHEDULED', 'APPROVAL'], default: 'MANUAL' })
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

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
