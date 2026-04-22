import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ─── Vendor DTOs ─────────────────────────────────────────

export class RegisterVendorDto {
  @ApiProperty({ example: 'Acme Solutions Pvt Ltd' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName: string;

  @ApiProperty({ example: 'vendor@acme.com' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ example: '29ABCDE1234F1ZK' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  revenueSharePct?: number;
}

export class ListVendorsQueryDto {
  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'APPROVED', 'SUSPENDED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

// ─── Module DTOs ─────────────────────────────────────────

export class CreateModuleDto {
  @ApiProperty({ example: 'whatsapp-integration' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  moduleCode: string;

  @ApiProperty({ example: 'WhatsApp Integration' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  moduleName: string;

  @ApiProperty({ example: 'communication' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Integrate WhatsApp messaging into your CRM' })
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  shortDescription: string;

  @ApiProperty({ example: 'Full WhatsApp integration with templates...' })
  @IsString()
  @MinLength(10)
  longDescription: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  screenshots?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demoVideoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentationUrl?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  pricingPlans?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  usageLimits?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  targetTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  launchOfferDays?: number;
}

export class UpdateModuleDto {
  @ApiPropertyOptional({ example: 'WhatsApp Integration Pro' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  moduleName?: string;

  @ApiPropertyOptional({ example: 'communication' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  longDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  screenshots?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demoVideoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentationUrl?: string;

  @ApiPropertyOptional({ example: '1.1.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  changelog?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  pricingPlans?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  usageLimits?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  targetTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  launchOfferDays?: number;
}

export class ListModulesQueryDto {
  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ example: 'communication' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'B2B' })
  @IsOptional()
  @IsString()
  businessType?: string;
}

// ─── Review DTOs ─────────────────────────────────────────

export class CreateReviewDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ example: 'Great integration!' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'This module saved us hours of work...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class ListReviewsQueryDto {
  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ default: '10' })
  @IsOptional()
  @IsString()
  limit?: string;
}

// ─── Install DTOs ────────────────────────────────────────

export class ActivateModuleDto {
  @ApiPropertyOptional({ example: 'sub_abc123' })
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @ApiPropertyOptional({ example: 'plan_basic' })
  @IsOptional()
  @IsString()
  planId?: string;
}
