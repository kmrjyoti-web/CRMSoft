import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  EmailTemplateListItem,
  EmailTemplateDetail,
  EmailTemplateListParams,
  EmailTemplateCreateData,
  EmailTemplateUpdateData,
  TemplatePreviewData,
  TemplatePreviewResult,
  EmailSignatureItem,
  EmailSignatureCreateData,
  EmailSignatureUpdateData,
} from "../types/communication.types";

const TEMPLATES_URL = "/email-templates";
const SIGNATURES_URL = "/email-signatures";

export const emailTemplatesService = {
  getAll: (params?: EmailTemplateListParams) =>
    apiClient
      .get<ApiResponse<EmailTemplateListItem[]>>(TEMPLATES_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<EmailTemplateDetail>>(`${TEMPLATES_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: EmailTemplateCreateData) =>
    apiClient
      .post<ApiResponse<EmailTemplateDetail>>(TEMPLATES_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: EmailTemplateUpdateData) =>
    apiClient
      .put<ApiResponse<EmailTemplateDetail>>(`${TEMPLATES_URL}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${TEMPLATES_URL}/${id}`)
      .then((r) => r.data),

  preview: (id: string, payload?: TemplatePreviewData) =>
    apiClient
      .post<ApiResponse<TemplatePreviewResult>>(
        `${TEMPLATES_URL}/${id}/preview`,
        payload ?? {},
      )
      .then((r) => r.data),
};

export const emailSignaturesService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<EmailSignatureItem[]>>(SIGNATURES_URL)
      .then((r) => r.data),

  create: (payload: EmailSignatureCreateData) =>
    apiClient
      .post<ApiResponse<EmailSignatureItem>>(SIGNATURES_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: EmailSignatureUpdateData) =>
    apiClient
      .put<ApiResponse<EmailSignatureItem>>(`${SIGNATURES_URL}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${SIGNATURES_URL}/${id}`)
      .then((r) => r.data),
};
