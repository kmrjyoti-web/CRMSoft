import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  emailTemplatesService,
  emailSignaturesService,
} from "../services/communication.service";
import type {
  EmailTemplateListParams,
  EmailTemplateCreateData,
  EmailTemplateUpdateData,
  TemplatePreviewData,
  EmailSignatureCreateData,
  EmailSignatureUpdateData,
} from "../types/communication.types";

// ── Template Hooks ──────────────────────────────────────────

const TEMPLATES_KEY = "email-templates";

export function useTemplatesList(params?: EmailTemplateListParams) {
  return useQuery({
    queryKey: [TEMPLATES_KEY, params],
    queryFn: () => emailTemplatesService.getAll(params),
  });
}

export function useTemplateDetail(id: string) {
  return useQuery({
    queryKey: [TEMPLATES_KEY, id],
    queryFn: () => emailTemplatesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailTemplateCreateData) =>
      emailTemplatesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmailTemplateUpdateData }) =>
      emailTemplatesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailTemplatesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: TemplatePreviewData;
    }) => emailTemplatesService.preview(id, data),
  });
}

// ── Signature Hooks ─────────────────────────────────────────

const SIGNATURES_KEY = "email-signatures";

export function useSignaturesList() {
  return useQuery({
    queryKey: [SIGNATURES_KEY],
    queryFn: () => emailSignaturesService.getAll(),
  });
}

export function useCreateSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailSignatureCreateData) =>
      emailSignaturesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SIGNATURES_KEY] }),
  });
}

export function useUpdateSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EmailSignatureUpdateData;
    }) => emailSignaturesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SIGNATURES_KEY] }),
  });
}

export function useDeleteSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailSignaturesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SIGNATURES_KEY] }),
  });
}
