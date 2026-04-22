import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { waTemplatesService } from '../services/wa-templates.service';

import type {
  WaTemplateCreateData,
  WaTemplateUpdateData,
  WaTemplateListParams,
} from '../types/template.types';

const KEY = 'wa-templates';

export function useWaTemplatesList(params?: WaTemplateListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => waTemplatesService.getAll(params),
  });
}

export function useWaTemplateDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => waTemplatesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWaTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WaTemplateCreateData) => waTemplatesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateWaTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WaTemplateUpdateData }) =>
      waTemplatesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteWaTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => waTemplatesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSyncWaTemplates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wabaId: string) => waTemplatesService.sync(wabaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
