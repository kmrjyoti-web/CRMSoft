import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/document-template.service";
import type {
  CustomizeTemplatePayload,
  PreviewPayload,
  PdfPayload,
  TemplateListParams,
} from "../types/document-template.types";

const KEYS = {
  list: "document-templates",
  detail: "document-template",
  byType: "document-templates-type",
  customization: "template-customization",
  sampleData: "template-sample-data",
};

// ── Queries ─────────────────────────────────────────────────

export function useTemplateList(params?: TemplateListParams) {
  return useQuery({
    queryKey: [KEYS.list, params],
    queryFn: () => svc.getTemplates(params),
  });
}

export function useTemplateDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.detail, id],
    queryFn: () => svc.getTemplate(id),
    enabled: !!id,
  });
}

export function useTemplatesByType(type: string) {
  return useQuery({
    queryKey: [KEYS.byType, type],
    queryFn: () => svc.getTemplatesByType(type),
    enabled: !!type,
  });
}

export function useTemplateCustomization(templateId: string) {
  return useQuery({
    queryKey: [KEYS.customization, templateId],
    queryFn: () => svc.getCustomization(templateId),
    enabled: !!templateId,
  });
}

export function useSampleData(type: string) {
  return useQuery({
    queryKey: [KEYS.sampleData, type],
    queryFn: () => svc.getSampleData(type),
    enabled: !!type,
  });
}

// ── Mutations ───────────────────────────────────────────────

export function useSaveCustomization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: CustomizeTemplatePayload }) =>
      svc.saveCustomization(templateId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEYS.customization, vars.templateId] });
      qc.invalidateQueries({ queryKey: [KEYS.list] });
    },
  });
}

export function useSetDefaultTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => svc.setDefaultTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.list] });
      qc.invalidateQueries({ queryKey: [KEYS.byType] });
    },
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: (payload: PreviewPayload) => svc.previewTemplate(payload),
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: (payload: PdfPayload) => svc.downloadPdf(payload),
  });
}
