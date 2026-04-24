import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  packageService,
  unitService,
  productService,
} from '../services/products.service';

import type {
  PackageCreateData,
  PackageUpdateData,
  ProductCreateData,
  ProductUpdateData,
  ProductListParams,
  ListParams,
} from '../types/products.types';

const PACKAGES_KEY = 'packages';
const UNIT_TYPES_KEY = 'unit-types';
const PRODUCTS_KEY = 'products';

// ---------------------------------------------------------------------------
// Package hooks
// ---------------------------------------------------------------------------

export function usePackagesList(params?: ListParams) {
  return useQuery({
    queryKey: [PACKAGES_KEY, params],
    queryFn: () => packageService.getAll(params).then((r) => r.data),
  });
}

export function usePackageDetail(id: string) {
  return useQuery({
    queryKey: [PACKAGES_KEY, id],
    queryFn: () => packageService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PackageCreateData) => packageService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PACKAGES_KEY] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PackageUpdateData }) =>
      packageService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PACKAGES_KEY] }),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packageService.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PACKAGES_KEY] }),
  });
}

// ---------------------------------------------------------------------------
// Unit hooks
// ---------------------------------------------------------------------------

export function useUnitTypes() {
  return useQuery({
    queryKey: [UNIT_TYPES_KEY],
    queryFn: () => unitService.getTypes().then((r) => r.data),
    staleTime: 1000 * 60 * 30, // 30 minutes — static data
  });
}

// ---------------------------------------------------------------------------
// Product hooks
// ---------------------------------------------------------------------------

export function useProductsList(params?: ProductListParams) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => productService.getAll(params).then((r) => r.data),
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateData) => productService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateData }) =>
      productService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deactivate(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}
