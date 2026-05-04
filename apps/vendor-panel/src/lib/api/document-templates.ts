import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  DocumentTemplate,
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  DocumentTemplateFilters,
} from '@/types/document-template';

export const documentTemplatesApi = {
  list: (filters?: DocumentTemplateFilters) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<DocumentTemplate>>>('/vendor/document-templates', { params: filters })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<DocumentTemplate>>(`/vendor/document-templates/${id}`)
      .then((r) => r.data),

  create: (data: CreateDocumentTemplateDto) =>
    apiClient
      .post<ApiResponse<DocumentTemplate>>('/vendor/document-templates', data)
      .then((r) => r.data),

  update: (id: string, data: UpdateDocumentTemplateDto) =>
    apiClient
      .patch<ApiResponse<DocumentTemplate>>(`/vendor/document-templates/${id}`, data)
      .then((r) => r.data),

  archive: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/vendor/document-templates/${id}`)
      .then((r) => r.data),

  duplicate: (id: string) =>
    apiClient
      .post<ApiResponse<DocumentTemplate>>(`/vendor/document-templates/${id}/duplicate`)
      .then((r) => r.data),

  preview: (id: string) =>
    apiClient
      .get<ApiResponse<{ html: string }>>(`/vendor/document-templates/${id}/preview`)
      .then((r) => r.data),
};
