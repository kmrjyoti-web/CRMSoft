import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAdminService } from '../services/wallet-admin.service';
import type { RechargePlanCreateData, CouponCreateData, ServiceRateCreateData } from '../types/wallet.types';

const KEY = 'wallet-admin';

// Wallets
export function useAllWallets(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, 'wallets', params],
    queryFn: () => walletAdminService.listWallets(params),
  });
}

export function useCreditWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, tokens, description }: { tenantId: string; tokens: number; description: string }) =>
      walletAdminService.creditWallet(tenantId, tokens, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// Recharge Plans
export function useAdminRechargePlans() {
  return useQuery({
    queryKey: [KEY, 'recharge-plans'],
    queryFn: () => walletAdminService.listRechargePlans(),
  });
}

export function useCreateRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RechargePlanCreateData) => walletAdminService.createRechargePlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'recharge-plans'] }),
  });
}

export function useUpdateRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RechargePlanCreateData & { isActive: boolean }> }) =>
      walletAdminService.updateRechargePlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'recharge-plans'] }),
  });
}

export function useDeleteRechargePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletAdminService.deleteRechargePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'recharge-plans'] }),
  });
}

// Coupons
export function useAdminCoupons() {
  return useQuery({
    queryKey: [KEY, 'coupons'],
    queryFn: () => walletAdminService.listCoupons(),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponCreateData) => walletAdminService.createCoupon(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'coupons'] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponCreateData & { isActive: boolean }> }) =>
      walletAdminService.updateCoupon(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'coupons'] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletAdminService.deleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'coupons'] }),
  });
}

// Service Rates
export function useAdminServiceRates(category?: string) {
  return useQuery({
    queryKey: [KEY, 'service-rates', category],
    queryFn: () => walletAdminService.listServiceRates(category),
  });
}

export function useCreateServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceRateCreateData) => walletAdminService.createServiceRate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'service-rates'] }),
  });
}

export function useUpdateServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceRateCreateData & { isActive: boolean }> }) =>
      walletAdminService.updateServiceRate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'service-rates'] }),
  });
}

export function useDeleteServiceRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletAdminService.deleteServiceRate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'service-rates'] }),
  });
}

// Analytics
export function useRevenueSummary(days?: number) {
  return useQuery({
    queryKey: [KEY, 'summary', days],
    queryFn: () => walletAdminService.getRevenueSummary(days),
  });
}

export function useSpendByCategory(tenantId?: string, days?: number) {
  return useQuery({
    queryKey: [KEY, 'spend-category', tenantId, days],
    queryFn: () => walletAdminService.getSpendByCategory(tenantId, days),
  });
}

export function useTopServices(tenantId?: string, days?: number) {
  return useQuery({
    queryKey: [KEY, 'top-services', tenantId, days],
    queryFn: () => walletAdminService.getTopServices(tenantId, days),
  });
}

export function useDailyTrend(tenantId?: string, days?: number) {
  return useQuery({
    queryKey: [KEY, 'daily-trend', tenantId, days],
    queryFn: () => walletAdminService.getDailyTrend(tenantId, days),
  });
}
