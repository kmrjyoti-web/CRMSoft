import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  SavedFormula,
  CreateFormulaPayload,
  EvaluateFormulaPayload,
  AiDesignPayload,
  AiFormulaPayload,
  AiFromImagePayload,
  AiRefinePayload,
  AiFormulaResult,
  CanvasDesign,
} from '../types/report-designer.types';

const FORMULAS = '/api/v1/formulas';
const AI = '/api/v1/report-ai';
const TEMPLATES = '/api/v1/document-templates';

// ── Formulas ──

export function getFormulas(category?: string) {
  return apiClient
    .get<ApiResponse<SavedFormula[]>>(FORMULAS, { params: category ? { category } : {} })
    .then((r) => r.data);
}

export function getFormula(id: string) {
  return apiClient.get<ApiResponse<SavedFormula>>(`${FORMULAS}/${id}`).then((r) => r.data);
}

export function createFormula(payload: CreateFormulaPayload) {
  return apiClient.post<ApiResponse<SavedFormula>>(FORMULAS, payload).then((r) => r.data);
}

export function updateFormula(id: string, payload: Partial<CreateFormulaPayload>) {
  return apiClient.put<ApiResponse<SavedFormula>>(`${FORMULAS}/${id}`, payload).then((r) => r.data);
}

export function deleteFormula(id: string) {
  return apiClient.delete<ApiResponse<null>>(`${FORMULAS}/${id}`).then((r) => r.data);
}

export function evaluateFormula(payload: EvaluateFormulaPayload) {
  return apiClient.post<ApiResponse<{ result: unknown }>>(`${FORMULAS}/evaluate`, payload).then((r) => r.data);
}

// ── AI ──

export function aiDesignReport(payload: AiDesignPayload) {
  return apiClient.post<ApiResponse<CanvasDesign>>(`${AI}/design-report`, payload).then((r) => r.data);
}

export function aiGenerateFormula(payload: AiFormulaPayload) {
  return apiClient.post<ApiResponse<AiFormulaResult>>(`${AI}/generate-formula`, payload).then((r) => r.data);
}

export function aiFromImage(payload: AiFromImagePayload) {
  return apiClient.post<ApiResponse<{ design: CanvasDesign; confidence: number }>>(`${AI}/from-image`, payload).then((r) => r.data);
}

export function aiRefineDesign(payload: AiRefinePayload) {
  return apiClient.post<ApiResponse<CanvasDesign>>(`${AI}/refine`, payload).then((r) => r.data);
}

// ── Save canvas JSON to template ──

export function saveCanvasDesign(templateId: string, design: CanvasDesign) {
  return apiClient
    .patch<ApiResponse<unknown>>(`${TEMPLATES}/${templateId}`, {
      templateVersion: 2,
      canvasJson: design,
    })
    .then((r) => r.data);
}
