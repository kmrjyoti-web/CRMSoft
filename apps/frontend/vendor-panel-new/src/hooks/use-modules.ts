'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '@/lib/api/modules';
import type { ModuleFilters, CreateModuleDto, ModuleFeature } from '@/types/module';

export function useModules(filters?: ModuleFilters) {
  return useQuery({
    queryKey: ['modules', filters],
    queryFn: () => modulesApi.list(filters),
  });
}

export function useModule(id: string) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => modulesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleDto) => modulesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateModuleDto> }) => modulesApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['modules'] });
      qc.invalidateQueries({ queryKey: ['module', vars.id] });
    },
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modulesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  });
}

export function useAddFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, feature }: { moduleId: string; feature: Omit<ModuleFeature, 'isDefault'> & { isDefault?: boolean } }) =>
      modulesApi.addFeature(moduleId, feature),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module', vars.moduleId] });
    },
  });
}

export function useUpdateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, featureCode, updates }: { moduleId: string; featureCode: string; updates: Partial<ModuleFeature> }) =>
      modulesApi.updateFeature(moduleId, featureCode, updates),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module', vars.moduleId] });
    },
  });
}

export function useRemoveFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, featureCode }: { moduleId: string; featureCode: string }) =>
      modulesApi.removeFeature(moduleId, featureCode),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module', vars.moduleId] });
    },
  });
}

export function useSetMenuKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, menuKeys }: { moduleId: string; menuKeys: string[] }) =>
      modulesApi.setMenuKeys(moduleId, menuKeys),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module', vars.moduleId] });
    },
  });
}

export function useDependencyTree(moduleId: string) {
  return useQuery({
    queryKey: ['module-deps', moduleId],
    queryFn: () => modulesApi.getDependencyTree(moduleId),
    enabled: !!moduleId,
  });
}

export function useSetDependencies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, dependsOn }: { moduleId: string; dependsOn: string[] }) =>
      modulesApi.setDependencies(moduleId, dependsOn),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module', vars.moduleId] });
      qc.invalidateQueries({ queryKey: ['module-deps', vars.moduleId] });
    },
  });
}
