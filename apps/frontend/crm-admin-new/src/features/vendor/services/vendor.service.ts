import { api } from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  VendorDashboardOverview,
  MRRDataPoint,
  GrowthDataPoint,
  PlanDistributionItem,
  TenantProfileItem,
  TenantActivityLogItem,
  LicenseKeyItem,
  GenerateLicenseData,
  SoftwareOfferItem,
  OfferFormData,
  ModuleDefinitionItem,
  PlanModuleAccessItem,
} from '../types/vendor.types';

const ADMIN_URL = '/api/v1/admin';

export const vendorService = {
  // ── Dashboard ──────────────────────────────────────────────
  getOverview: (days = 30) =>
    api
      .get<ApiResponse<VendorDashboardOverview>>(`${ADMIN_URL}/vendor/dashboard`, { params: { days } })
      .then((r) => r.data),

  getMRR: (days = 180) =>
    api
      .get<ApiResponse<MRRDataPoint[]>>(`${ADMIN_URL}/vendor/dashboard/mrr`, { params: { days } })
      .then((r) => r.data),

  getTenantGrowth: (days = 90) =>
    api
      .get<ApiResponse<GrowthDataPoint[]>>(`${ADMIN_URL}/vendor/dashboard/growth`, { params: { days } })
      .then((r) => r.data),

  getPlanDistribution: () =>
    api
      .get<ApiResponse<PlanDistributionItem[]>>(`${ADMIN_URL}/vendor/dashboard/plan-distribution`)
      .then((r) => r.data),

  // ── Tenant Profile ─────────────────────────────────────────
  getTenantProfile: (tenantId: string) =>
    api
      .get<ApiResponse<TenantProfileItem>>(`${ADMIN_URL}/tenants/${tenantId}/profile`)
      .then((r) => r.data),

  updateTenantProfile: (tenantId: string, data: Partial<TenantProfileItem>) =>
    api
      .put<ApiResponse<TenantProfileItem>>(`${ADMIN_URL}/tenants/${tenantId}/profile`, data)
      .then((r) => r.data),

  getTenantActivity: (tenantId: string, params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<TenantActivityLogItem[]>>(`${ADMIN_URL}/tenants/${tenantId}/activity`, { params })
      .then((r) => r.data),

  // ── Licenses ───────────────────────────────────────────────
  listLicenses: (params?: { status?: string; tenantId?: string; page?: number; limit?: number }) =>
    api
      .get<ApiResponse<LicenseKeyItem[]>>(`${ADMIN_URL}/licenses`, { params })
      .then((r) => r.data),

  generateLicense: (data: GenerateLicenseData) =>
    api
      .post<ApiResponse<LicenseKeyItem>>(`${ADMIN_URL}/licenses/generate`, data)
      .then((r) => r.data),

  getLicense: (id: string) =>
    api
      .get<ApiResponse<LicenseKeyItem>>(`${ADMIN_URL}/licenses/${id}`)
      .then((r) => r.data),

  activateLicense: (id: string) =>
    api
      .post<ApiResponse<LicenseKeyItem>>(`${ADMIN_URL}/licenses/${id}/activate`)
      .then((r) => r.data),

  suspendLicense: (id: string) =>
    api
      .post<ApiResponse<LicenseKeyItem>>(`${ADMIN_URL}/licenses/${id}/suspend`)
      .then((r) => r.data),

  revokeLicense: (id: string) =>
    api
      .post<ApiResponse<LicenseKeyItem>>(`${ADMIN_URL}/licenses/${id}/revoke`)
      .then((r) => r.data),

  validateLicense: (key: string) =>
    api
      .post<ApiResponse<{ valid: boolean; license?: LicenseKeyItem }>>(`${ADMIN_URL}/licenses/validate`, {
        licenseKey: key,
      })
      .then((r) => r.data),

  // ── Offers ─────────────────────────────────────────────────
  listOffers: (params?: { isActive?: boolean; page?: number; limit?: number }) =>
    api
      .get<ApiResponse<SoftwareOfferItem[]>>(`${ADMIN_URL}/offers`, { params })
      .then((r) => r.data),

  createOffer: (data: OfferFormData) =>
    api
      .post<ApiResponse<SoftwareOfferItem>>(`${ADMIN_URL}/offers`, data)
      .then((r) => r.data),

  updateOffer: (id: string, data: Partial<OfferFormData>) =>
    api
      .put<ApiResponse<SoftwareOfferItem>>(`${ADMIN_URL}/offers/${id}`, data)
      .then((r) => r.data),

  deactivateOffer: (id: string) =>
    api
      .post<ApiResponse<SoftwareOfferItem>>(`${ADMIN_URL}/offers/${id}/deactivate`)
      .then((r) => r.data),

  // ── Modules ────────────────────────────────────────────────
  listModules: (params?: { category?: string; isActive?: boolean }) =>
    api
      .get<ApiResponse<ModuleDefinitionItem[]>>(`${ADMIN_URL}/modules`, { params })
      .then((r) => r.data),

  seedModules: () =>
    api
      .post<ApiResponse<{ seeded: number }>>(`${ADMIN_URL}/modules/seed`)
      .then((r) => r.data),

  getPlanModuleAccess: (planId: string) =>
    api
      .get<ApiResponse<PlanModuleAccessItem[]>>(`${ADMIN_URL}/plans/${planId}/module-access`)
      .then((r) => r.data),

  updatePlanModuleAccess: (planId: string, modules: { moduleCode: string; accessLevel: string }[]) =>
    api
      .put<ApiResponse<PlanModuleAccessItem[]>>(`${ADMIN_URL}/plans/${planId}/module-access`, { modules })
      .then((r) => r.data),

  getAccessMatrix: () =>
    api
      .get<ApiResponse<Record<string, PlanModuleAccessItem[]>>>(`${ADMIN_URL}/modules/access-matrix`)
      .then((r) => r.data),
};
