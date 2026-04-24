'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '@/lib/api/coupons';
import type { CouponCreateData } from '@/types/coupon';

export function useCoupons(filters?: { search?: string; industryCode?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['coupons', filters],
    queryFn: () => couponsApi.list(filters),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponCreateData) => couponsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponCreateData> }) => couponsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
}
