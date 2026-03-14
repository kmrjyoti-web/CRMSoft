import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  DocumentTemplate,
  TemplateCustomization,
  CustomizeTemplatePayload,
  PreviewPayload,
  PdfPayload,
  TemplateListParams,
} from "../types/document-template.types";

const BASE = "/api/v1/document-templates";
const DOCS = "/api/v1/documents";

// ── List ────────────────────────────────────────────────────

export function getTemplates(params?: TemplateListParams) {
  return apiClient
    .get<ApiResponse<DocumentTemplate[]>>(BASE, { params })
    .then((r) => r.data);
}

// ── Detail ──────────────────────────────────────────────────

export function getTemplate(id: string) {
  return apiClient
    .get<ApiResponse<DocumentTemplate>>(`${BASE}/${id}`)
    .then((r) => r.data);
}

// ── By Type ─────────────────────────────────────────────────

export function getTemplatesByType(type: string) {
  return apiClient
    .get<ApiResponse<DocumentTemplate[]>>(`${BASE}/by-type/${type}`)
    .then((r) => r.data);
}

// ── Customization ───────────────────────────────────────────

export function getCustomization(templateId: string) {
  return apiClient
    .get<ApiResponse<TemplateCustomization>>(`${BASE}/${templateId}/customization`)
    .then((r) => r.data);
}

export function saveCustomization(templateId: string, payload: CustomizeTemplatePayload) {
  return apiClient
    .post<ApiResponse<TemplateCustomization>>(`${BASE}/customize/${templateId}`, payload)
    .then((r) => r.data);
}

// ── Set Default ─────────────────────────────────────────────

export function setDefaultTemplate(templateId: string) {
  return apiClient
    .post<ApiResponse<DocumentTemplate>>(`${BASE}/${templateId}/set-default`)
    .then((r) => r.data);
}

// ── Preview ─────────────────────────────────────────────────

export function previewTemplate(payload: PreviewPayload) {
  return apiClient
    .post<ApiResponse<string>>(`${DOCS}/preview`, payload)
    .then((r) => r.data);
}

// ── PDF Download ────────────────────────────────────────────

export function downloadPdf(payload: PdfPayload) {
  return apiClient
    .post(`${DOCS}/pdf`, payload, { responseType: "blob" })
    .then((r) => r.data as Blob);
}

// ── Sample Data ─────────────────────────────────────────────

export function getSampleData(type: string) {
  return apiClient
    .get<ApiResponse<Record<string, unknown>>>(`${DOCS}/sample-data/${type}`)
    .then((r) => r.data);
}
