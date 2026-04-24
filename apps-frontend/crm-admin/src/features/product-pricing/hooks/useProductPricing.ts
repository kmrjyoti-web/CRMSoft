import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/product-pricing.service";
import type { SetPricesDto, SetGroupPriceDto, SetSlabPricesDto, EffectivePriceDto, BulkUpdatePricesDto } from "../types/product-pricing.types";

const KEY = "product-pricing";

export function useProductPrices(productId: string, params?: { priceType?: string; groupId?: string }) {
  return useQuery({
    queryKey: [KEY, productId, params],
    queryFn: () => svc.getProductPrices(productId, params),
    enabled: !!productId,
  });
}

export function usePriceList(productId: string) {
  return useQuery({
    queryKey: [KEY, "list", productId],
    queryFn: () => svc.getPriceList(productId),
    enabled: !!productId,
  });
}

export function useSetPrices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; dto: SetPricesDto }) => svc.setPrices(vars.productId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.productId] }),
  });
}

export function useSetGroupPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; dto: SetGroupPriceDto }) => svc.setGroupPrice(vars.productId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.productId] }),
  });
}

export function useSetSlabPrices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; dto: SetSlabPricesDto }) => svc.setSlabPrices(vars.productId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.productId] }),
  });
}

export function useEffectivePrice() {
  return useMutation({
    mutationFn: (dto: EffectivePriceDto) => svc.getEffectivePrice(dto),
  });
}

export function useBulkUpdatePrices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkUpdatePricesDto) => svc.bulkUpdatePrices(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeletePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (priceId: string) => svc.deletePrice(priceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
