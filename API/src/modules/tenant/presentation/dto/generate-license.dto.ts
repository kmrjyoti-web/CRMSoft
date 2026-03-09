import {
  IsUUID, IsOptional, IsInt, IsDateString, IsString, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateLicenseDto {
  @ApiProperty({ description: 'Tenant ID to generate license for' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Plan ID to associate with the license' })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({ description: 'Maximum number of users allowed' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'License expiry date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Allowed modules configuration (JSON)' })
  @IsOptional()
  allowedModules?: any;

  @ApiPropertyOptional({ description: 'Internal notes about this license' })
  @IsOptional()
  @IsString()
  notes?: string;
}
