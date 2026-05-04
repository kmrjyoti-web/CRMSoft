import {
  IsOptional, IsString, IsEnum, IsArray, IsInt, Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DbStrategy } from '@prisma/identity-client';

export class UpsertTenantProfileDto {
  @ApiPropertyOptional({ description: 'Company legal name' })
  @IsOptional()
  @IsString()
  companyLegalName?: string;

  @ApiPropertyOptional({ description: 'Industry vertical' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Support email address' })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiPropertyOptional({ enum: DbStrategy, description: 'Database strategy' })
  @IsOptional()
  @IsEnum(DbStrategy)
  dbStrategy?: string;

  @ApiPropertyOptional({ description: 'Primary contact full name' })
  @IsOptional()
  @IsString()
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email' })
  @IsOptional()
  @IsString()
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone' })
  @IsOptional()
  @IsString()
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Billing address (JSON)' })
  @IsOptional()
  billingAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'GSTIN number' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional({ description: 'PAN number' })
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional({ description: 'Account manager user ID' })
  @IsOptional()
  @IsString()
  accountManagerId?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Maximum disk quota in MB' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiskQuotaMb?: number;
}
