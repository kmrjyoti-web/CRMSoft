import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/quotation-templates.service";
import type { CreateTemplateDto, UseTemplateDto, TemplateFilters } from "../types/quotation-templates.types";

const KEY = "quotation-templates";

export function useQuotationTemplates(params?: TemplateFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listTemplates(params),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTemplateDto) => svc.createTemplate(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateTemplateDto> }) => svc.updateTemplate(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateFromTemplate() {
  return useMutation({
    mutationFn: (vars: { id: string; dto: UseTemplateDto }) => svc.createFromTemplate(vars.id, vars.dto),
  });
}
