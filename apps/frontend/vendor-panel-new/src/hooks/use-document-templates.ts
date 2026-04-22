'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentTemplatesApi } from '@/lib/api/document-templates';
import type {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  DocumentTemplateFilters,
} from '@/types/document-template';

export function useDocumentTemplates(filters?: DocumentTemplateFilters) {
  return useQuery({
    queryKey: ['document-templates', filters],
    queryFn: () => documentTemplatesApi.list(filters),
  });
}

export function useDocumentTemplate(id: string) {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: () => documentTemplatesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentTemplateDto) => documentTemplatesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-templates'] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentTemplateDto }) =>
      documentTemplatesApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['document-templates'] });
      qc.invalidateQueries({ queryKey: ['document-template', vars.id] });
    },
  });
}

export function useArchiveTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentTemplatesApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-templates'] }),
  });
}

export function useDuplicateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentTemplatesApi.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-templates'] }),
  });
}
