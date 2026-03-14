'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '@/lib/api/packages';
import type { PackageFilters, CreatePackageDto, AddModuleToPackageDto, EntityLimit } from '@/types/package';

export function usePackages(filters?: PackageFilters) {
  return useQuery({
    queryKey: ['packages', filters],
    queryFn: () => packagesApi.list(filters),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackageDto) => packagesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePackageDto> }) => packagesApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['package', vars.id] });
    },
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });
}

export function useAddModuleToPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, dto }: { packageId: string; dto: AddModuleToPackageDto }) =>
      packagesApi.addModule(packageId, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['package', vars.packageId] });
    },
  });
}

export function useUpdatePackageModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, moduleId, updates }: { packageId: string; moduleId: string; updates: Partial<AddModuleToPackageDto> }) =>
      packagesApi.updateModule(packageId, moduleId, updates),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['package', vars.packageId] });
    },
  });
}

export function useRemoveModuleFromPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, moduleId }: { packageId: string; moduleId: string }) =>
      packagesApi.removeModule(packageId, moduleId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['package', vars.packageId] });
    },
  });
}

export function useUpdatePackageLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, entityLimits }: { packageId: string; entityLimits: Record<string, EntityLimit> }) =>
      packagesApi.updateLimits(packageId, entityLimits),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['package', vars.packageId] });
    },
  });
}
