// ═══════════════════════════════════════════════════════════
// VENDOR MANAGEMENT TYPES
// ═══════════════════════════════════════════════════════════

// ── Tenant Profile ─────────────────────────────────────────

export interface TenantProfileItem {
  id: string;
  tenantId: string;
  companyLegalName: string | null;
  industry: string | null;
  website: string | null;
  supportEmail: string | null;
  dbStrategy: 'SHARED' | 'DEDICATED';
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  billingAddress: any;
  gstin: string | null;
  pan: string | null;
  accountManagerId: string | null;
  notes: string | null;
  tags: string[];
  maxDiskQuotaMb: number;
  currentDiskUsageMb: number;
  tenant?: { id: string; name: string; slug: string; status: string; domain: string | null };
}

// ── License Keys ───────────────────────────────────────────

export type LicenseStatus = 'LIC_ACTIVE' | 'LIC_EXPIRED' | 'LIC_SUSPENDED' | 'LIC_REVOKED';

export interface LicenseKeyItem {
  id: string;
  tenantId: string;
  licenseKey: string;
  planId: string;
  status: LicenseStatus;
  activatedAt: string | null;
  expiresAt: string | null;
  maxUsers: number;
  allowedModules: any;
  lastValidatedAt: string | null;
  notes: string | null;
  createdAt: string;
  tenant?: { id: string; name: string };
  plan?: { id: string; name: string };
}

export interface GenerateLicenseData {
  tenantId: string;
  planId: string;
  maxUsers?: number;
  expiresAt?: string;
  allowedModules?: any;
  notes?: string;
}

// ── Software Offers ────────────────────────────────────────

export type OfferType =
  | 'TRIAL_EXTENSION'
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FLAT'
  | 'BONUS_TOKENS'
  | 'FREE_UPGRADE';

export interface SoftwareOfferItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  offerType: OfferType;
  value: number;
  applicablePlanIds: string[];
  validFrom: string;
  validTo: string;
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
  autoApply: boolean;
  terms: string | null;
  createdAt: string;
}

export interface OfferFormData {
  name: string;
  code: string;
  description?: string;
  offerType: string;
  value: number;
  applicablePlanIds?: string[];
  validFrom: string;
  validTo: string;
  maxRedemptions?: number;
  autoApply?: boolean;
  terms?: string;
}

// ── Module Definitions ─────────────────────────────────────

export type ModuleAccessLevel = 'MOD_DISABLED' | 'MOD_READONLY' | 'MOD_FULL';

export interface ModuleDefinitionItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  isCore: boolean;
  iconName: string | null;
  sortOrder: number;
  dependsOn: string[];
  isActive: boolean;
}

export interface PlanModuleAccessItem {
  id: string;
  planId: string;
  moduleCode: string;
  accessLevel: ModuleAccessLevel;
  customConfig: any;
}

// ── Tenant Activity ────────────────────────────────────────

export interface TenantActivityLogItem {
  id: string;
  tenantId: string;
  action: string;
  category: string;
  details: string | null;
  metadata: any;
  performedById: string | null;
  createdAt: string;
  tenant?: { name: string };
}

// ── Dashboard ──────────────────────────────────────────────

export interface VendorDashboardOverview {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrr: number;
  arr: number;
  newTenants: number;
  churnRate: number;
}

export interface MRRDataPoint {
  month: string;
  mrr: number;
}

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export interface PlanDistributionItem {
  planName: string;
  planCode: string;
  count: number;
  percentage: number;
}
