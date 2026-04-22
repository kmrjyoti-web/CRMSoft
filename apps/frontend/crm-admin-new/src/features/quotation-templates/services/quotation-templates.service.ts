import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { QuotationTemplate, CreateTemplateDto, UseTemplateDto, TemplateFilters } from "../types/quotation-templates.types";

const BASE = "/api/v1/quotation-templates";

export function listTemplates(params?: TemplateFilters) {
  return apiClient.get<ApiResponse<QuotationTemplate[]>>(BASE, { params }).then((r) => r.data);
}

export function createTemplate(dto: CreateTemplateDto) {
  return apiClient.post<ApiResponse<QuotationTemplate>>(BASE, dto).then((r) => r.data);
}

export function updateTemplate(id: string, dto: Partial<CreateTemplateDto>) {
  return apiClient.put<ApiResponse<QuotationTemplate>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function createFromTemplate(id: string, dto: UseTemplateDto) {
  return apiClient.post<ApiResponse<unknown>>(`${BASE}/${id}/create-quotation`, dto).then((r) => r.data);
}
