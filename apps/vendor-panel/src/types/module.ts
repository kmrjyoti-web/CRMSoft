export type ModuleCategory =
  | 'CORE' | 'CRM' | 'SALES' | 'FINANCE' | 'POST_SALES'
  | 'COMMUNICATION' | 'AI' | 'REPORTS' | 'DEVELOPER'
  | 'WORKFLOW' | 'MARKETING' | 'OPERATIONS' | 'INTEGRATIONS'
  | 'MARKETPLACE' | 'ADDON' | 'ANALYTICS';

export type ModuleStatus = 'ACTIVE' | 'BETA' | 'DEPRECATED' | 'COMING_SOON';
export type FeatureType = 'PAGE' | 'WIDGET' | 'REPORT' | 'ACTION' | 'INTEGRATION';
export type ModulePricingType = 'FREE' | 'INCLUDED' | 'ADDON' | 'ONE_TIME' | 'PER_USAGE';

export interface ModuleFeature {
  code: string;
  name: string;
  type: FeatureType;
  menuKey?: string | null;
  isDefault: boolean;
}

export interface SoftwareModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: ModuleCategory;
  version: string;
  moduleStatus: ModuleStatus;
  isCore: boolean;
  iconName?: string;
  sortOrder: number;
  dependsOn: string[];
  features: ModuleFeature[];
  menuKeys: string[];
  defaultPricingType: ModulePricingType;
  basePrice: number;
  priceMonthly?: number;
  priceYearly?: number;
  oneTimeSetupFee?: number;
  trialDays: number;
  trialFeatures: string[];
  usagePricing?: Record<string, number>;
  isFreeInBase: boolean;
  isFeatured: boolean;
  isActive: boolean;
  industryCode?: string | null;
  _count?: { packageModules: number; tenantModules: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  code: string;
  name: string;
  description?: string;
  category: ModuleCategory;
  version?: string;
  moduleStatus?: ModuleStatus;
  isCore?: boolean;
  iconName?: string;
  features?: ModuleFeature[];
  menuKeys?: string[];
  dependsOn?: string[];
  defaultPricingType?: ModulePricingType;
  basePrice?: number;
  priceMonthly?: number;
  priceYearly?: number;
  oneTimeSetupFee?: number;
  trialDays?: number;
  trialFeatures?: string[];
  usagePricing?: Record<string, number>;
  sortOrder?: number;
  industryCode?: string;
}

export interface ModuleFilters {
  search?: string;
  category?: ModuleCategory;
  status?: ModuleStatus;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface DependencyNode {
  code: string;
  name: string;
  level: number;
}
