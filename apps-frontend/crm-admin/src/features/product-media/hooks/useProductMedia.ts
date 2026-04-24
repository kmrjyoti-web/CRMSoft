import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/product-media.service";
import type { AddRelatedProductsDto } from "../types/product-media.types";

const KEY = "product-media";

export function useProductImages(productId: string) {
  return useQuery({
    queryKey: [KEY, "images", productId],
    queryFn: () => svc.getImages(productId),
    enabled: !!productId,
  });
}

export function useManageImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; images: { url: string; alt?: string; isPrimary?: boolean; displayOrder?: number }[] }) =>
      svc.manageImages(vars.productId, vars.images),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, "images", vars.productId] }),
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: [KEY, "related", productId],
    queryFn: () => svc.getRelated(productId),
    enabled: !!productId,
  });
}

export function useAddRelatedProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; dto: AddRelatedProductsDto }) =>
      svc.addRelated(vars.productId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, "related", vars.productId] }),
  });
}

export function useRemoveRelatedProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; relationId: string }) =>
      svc.removeRelated(vars.productId, vars.relationId),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, "related", vars.productId] }),
  });
}

export function useHSNSearch(query: string) {
  return useQuery({
    queryKey: [KEY, "hsn", query],
    queryFn: () => svc.searchHSN(query),
    enabled: query.length >= 2,
  });
}
