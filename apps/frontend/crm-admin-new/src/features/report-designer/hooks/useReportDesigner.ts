import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../services/report-designer.service';
import type { CreateFormulaPayload, EvaluateFormulaPayload, AiDesignPayload, AiFormulaPayload, AiFromImagePayload, AiRefinePayload, CanvasDesign } from '../types/report-designer.types';

// ── Formula Queries ──

export function useFormulaList(category?: string) {
  return useQuery({
    queryKey: ['formulas', category],
    queryFn: () => service.getFormulas(category),
  });
}

export function useFormulaDetail(id: string) {
  return useQuery({
    queryKey: ['formula', id],
    queryFn: () => service.getFormula(id),
    enabled: !!id,
  });
}

// ── Formula Mutations ──

export function useCreateFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFormulaPayload) => service.createFormula(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formulas'] }),
  });
}

export function useUpdateFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFormulaPayload> }) =>
      service.updateFormula(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formulas'] }),
  });
}

export function useDeleteFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.deleteFormula(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formulas'] }),
  });
}

export function useEvaluateFormula() {
  return useMutation({
    mutationFn: (payload: EvaluateFormulaPayload) => service.evaluateFormula(payload),
  });
}

// ── AI Mutations ──

export function useAiDesignReport() {
  return useMutation({
    mutationFn: (payload: AiDesignPayload) => service.aiDesignReport(payload),
  });
}

export function useAiGenerateFormula() {
  return useMutation({
    mutationFn: (payload: AiFormulaPayload) => service.aiGenerateFormula(payload),
  });
}

export function useAiFromImage() {
  return useMutation({
    mutationFn: (payload: AiFromImagePayload) => service.aiFromImage(payload),
  });
}

export function useAiRefineDesign() {
  return useMutation({
    mutationFn: (payload: AiRefinePayload) => service.aiRefineDesign(payload),
  });
}

// ── Save Design ──

export function useSaveDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, design }: { templateId: string; design: CanvasDesign }) =>
      service.saveCanvasDesign(templateId, design),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}
