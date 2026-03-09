import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../services/vendor.service';
import type { GenerateLicenseData, OfferFormData } from '../types/vendor.types';

const KEY = 'vendor';

// ── Dashboard ────────────────────────────────────────────────

export function useVendorOverview(days = 30) {
  return useQuery({
    queryKey: [KEY, 'overview', days],
    queryFn: () => vendorService.getOverview(days),
  });
}

export function useVendorMRR(days = 180) {
  return useQuery({
    queryKey: [KEY, 'mrr', days],
    queryFn: () => vendorService.getMRR(days),
  });
}

export function useTenantGrowth(days = 90) {
  return useQuery({
    queryKey: [KEY, 'growth', days],
    queryFn: () => vendorService.getTenantGrowth(days),
  });
}

export function usePlanDistribution() {
  return useQuery({
    queryKey: [KEY, 'plan-distribution'],
    queryFn: () => vendorService.getPlanDistribution(),
  });
}

// ── Tenant Profile ───────────────────────────────────────────

export function useTenantProfile(tenantId?: string) {
  return useQuery({
    queryKey: [KEY, 'tenant-profile', tenantId],
    queryFn: () => vendorService.getTenantProfile(tenantId!),
    enabled: !!tenantId,
  });
}

export function useUpdateTenantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { tenantId: string; data: any }) =>
      vendorService.updateTenantProfile(params.tenantId, params.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, 'tenant-profile', variables.tenantId] });
    },
  });
}

export function useTenantActivity(tenantId?: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, 'activity', tenantId, params],
    queryFn: () => vendorService.getTenantActivity(tenantId!, params),
    enabled: !!tenantId,
  });
}

// ── Licenses ─────────────────────────────────────────────────

export function useLicenses(params?: { status?: string; tenantId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, 'licenses', params],
    queryFn: () => vendorService.listLicenses(params),
  });
}

export function useGenerateLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateLicenseData) => vendorService.generateLicense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'licenses'] });
    },
  });
}

export function useActivateLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.activateLicense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'licenses'] });
    },
  });
}

export function useSuspendLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.suspendLicense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'licenses'] });
    },
  });
}

export function useRevokeLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.revokeLicense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'licenses'] });
    },
  });
}

// ── Offers ───────────────────────────────────────────────────

export function useOffers(params?: { isActive?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, 'offers', params],
    queryFn: () => vendorService.listOffers(params),
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OfferFormData) => vendorService.createOffer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'offers'] });
    },
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: Partial<OfferFormData> }) =>
      vendorService.updateOffer(params.id, params.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'offers'] });
    },
  });
}

export function useDeactivateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorService.deactivateOffer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'offers'] });
    },
  });
}

// ── Modules ──────────────────────────────────────────────────

export function useModuleDefinitions(params?: { category?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: [KEY, 'modules', params],
    queryFn: () => vendorService.listModules(params),
  });
}

export function useSeedModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => vendorService.seedModules(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, 'modules'] });
    },
  });
}

export function usePlanModuleAccess(planId?: string) {
  return useQuery({
    queryKey: [KEY, 'module-access', planId],
    queryFn: () => vendorService.getPlanModuleAccess(planId!),
    enabled: !!planId,
  });
}

export function useUpdatePlanModuleAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { planId: string; modules: { moduleCode: string; accessLevel: string }[] }) =>
      vendorService.updatePlanModuleAccess(params.planId, params.modules),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, 'module-access', variables.planId] });
    },
  });
}
