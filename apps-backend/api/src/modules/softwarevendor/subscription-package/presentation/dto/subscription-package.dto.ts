import {
  IsString, IsOptional, IsNumber, IsBoolean, IsInt,
  Min, IsArray, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionPackageDto {
  @IsString()
  packageCode: string;

  @IsString()
  packageName: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsOptional()
  applicableTypes?: Record<string, unknown>;

  @IsOptional()
  includedModules?: Record<string, unknown>;

  @IsOptional()
  limits?: Record<string, unknown>;

  @IsNumber()
  @Min(0)
  priceMonthlyInr: number;

  @IsNumber()
  @Min(0)
  priceYearlyInr: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  yearlyDiscountPct?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  trialDays?: number;

  @IsOptional()
  featureFlags?: Record<string, unknown>;

  @IsInt()
  planLevel: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateSubscriptionPackageDto {
  @IsString()
  @IsOptional()
  packageName?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsOptional()
  applicableTypes?: Record<string, unknown>;

  @IsOptional()
  includedModules?: Record<string, unknown>;

  @IsOptional()
  limits?: Record<string, unknown>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMonthlyInr?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceYearlyInr?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  yearlyDiscountPct?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  trialDays?: number;

  @IsOptional()
  featureFlags?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  planLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class ListPackagesQueryDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activeOnly?: boolean;
}
