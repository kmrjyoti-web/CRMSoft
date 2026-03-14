import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agencyDiscountService, itemDiscountService, promotionService } from '../services/discount.service';

// ── Agency Discounts ──────────────────────────────────────────────────

export function useAgencyDiscounts() {
  return useQuery({ queryKey: ['agency-discounts'], queryFn: agencyDiscountService.list });
}

export function useCreateAgencyDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agencyDiscountService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency-discounts'] }),
  });
}

export function useUpdateAgencyDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => agencyDiscountService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency-discounts'] }),
  });
}

export function useDeleteAgencyDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agencyDiscountService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency-discounts'] }),
  });
}

// ── Item Discounts ────────────────────────────────────────────────────

export function useItemDiscounts() {
  return useQuery({ queryKey: ['item-discounts'], queryFn: itemDiscountService.list });
}

export function useCreateItemDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itemDiscountService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-discounts'] }),
  });
}

export function useUpdateItemDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => itemDiscountService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-discounts'] }),
  });
}

export function useDeleteItemDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itemDiscountService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-discounts'] }),
  });
}

// ── Promotions ────────────────────────────────────────────────────────

export function usePromotions() {
  return useQuery({ queryKey: ['promotions'], queryFn: promotionService.list });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => promotionService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
  });
}
