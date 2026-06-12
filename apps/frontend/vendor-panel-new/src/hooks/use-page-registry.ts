'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageRegistryApi } from '@/lib/api/page-registry';
import type { PageFilters, UpdatePageDto, AssignPageDto, BulkAssignDto } from '@/types/page-registry';

export function usePages(filters?: PageFilters) {
  return useQuery({
    queryKey: ['pages', filters],
    queryFn: () => pageRegistryApi.list(filters),
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => pageRegistryApi.getById(id),
    enabled: !!id,
  });
}

export function usePageStats() {
  return useQuery({
    queryKey: ['page-stats'],
    queryFn: () => pageRegistryApi.stats(),
  });
}

export function useUnassignedPages(filters?: PageFilters) {
  return useQuery({
    queryKey: ['pages-unassigned', filters],
    queryFn: () => pageRegistryApi.unassigned(filters),
  });
}

export function useScanPages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => pageRegistryApi.scan(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page-stats'] });
      qc.invalidateQueries({ queryKey: ['pages-unassigned'] });
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageDto }) =>
      pageRegistryApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page', vars.id] });
      qc.invalidateQueries({ queryKey: ['page-stats'] });
    },
  });
}

export function useAssignPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPageDto }) =>
      pageRegistryApi.assign(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page-stats'] });
      qc.invalidateQueries({ queryKey: ['pages-unassigned'] });
      qc.invalidateQueries({ queryKey: ['module-pages'] });
    },
  });
}

export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAssignDto) => pageRegistryApi.bulkAssign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page-stats'] });
      qc.invalidateQueries({ queryKey: ['pages-unassigned'] });
      qc.invalidateQueries({ queryKey: ['module-pages'] });
    },
  });
}

export function useUnassignPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pageRegistryApi.unassign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page-stats'] });
      qc.invalidateQueries({ queryKey: ['pages-unassigned'] });
      qc.invalidateQueries({ queryKey: ['module-pages'] });
    },
  });
}

export function useModulePages(moduleCode: string) {
  return useQuery({
    queryKey: ['module-pages', moduleCode],
    queryFn: () => pageRegistryApi.getModulePages(moduleCode),
    enabled: !!moduleCode,
  });
}

export function useReorderModulePages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleCode, orderedIds }: { moduleCode: string; orderedIds: string[] }) =>
      pageRegistryApi.reorderModulePages(moduleCode, orderedIds),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module-pages', vars.moduleCode] });
    },
  });
}

export function useSyncMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleCode: string) => pageRegistryApi.syncMenus(moduleCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-pages'] });
    },
  });
}
