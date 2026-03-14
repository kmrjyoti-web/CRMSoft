import type { ModulePricingType, SoftwareModule } from './module';

export interface EntityLimit {
  limit: number;
  extraPricePerUnit: number;
}

export interface PackageModuleConfig {
  id: string;
  packageId: string;
  moduleId: string;
  pricingType: ModulePricingType;
  addonPrice?: number;
  oneTimeFee?: number;
  enabledFeatures: string[];
  disabledFeatures: string[];
  trialAllowed: boolean;
  trialDays?: number;
  moduleLimits?: Record<string, unknown>;
  sortOrder: number;
  module: SoftwareModule;
}

export interface SubscriptionPackage {
  id: string;
  packageCode: string;
  packageName: string;
  tagline?: string;
  description?: string;
  tier: number;
  priceMonthlyInr: number;
  quarterlyPrice?: number;
  priceYearlyInr: number;
  yearlyDiscountPct: number;
  oneTimeSetupFee?: number;
  currency: string;
  trialDays: number;
  entityLimits: Record<string, EntityLimit>;
  hasDedicatedDb: boolean;
  maxDbSizeMb?: number;
  isPopular: boolean;
  badgeText?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  isPublic: boolean;
  sortOrder: number;
  industryCode?: string | null;
  packageModules?: PackageModuleConfig[];
  _count?: { packageModules: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  packageCode: string;
  packageName: string;
  tagline?: string;
  description?: string;
  tier?: number;
  priceMonthlyInr: number;
  quarterlyPrice?: number;
  priceYearlyInr: number;
  yearlyDiscountPct?: number;
  oneTimeSetupFee?: number;
  currency?: string;
  trialDays?: number;
  entityLimits?: Record<string, EntityLimit>;
  hasDedicatedDb?: boolean;
  maxDbSizeMb?: number;
  isPopular?: boolean;
  badgeText?: string;
  color?: string;
  sortOrder?: number;
  industryCode?: string;
}

export interface PackageFilters {
  search?: string;
  isActive?: boolean;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface AddModuleToPackageDto {
  moduleId: string;
  pricingType?: ModulePricingType;
  addonPrice?: number;
  oneTimeFee?: number;
  enabledFeatures?: string[];
  disabledFeatures?: string[];
  trialAllowed?: boolean;
  trialDays?: number;
  moduleLimits?: Record<string, unknown>;
  sortOrder?: number;
}
