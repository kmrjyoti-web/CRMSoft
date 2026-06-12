import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type { DocumentFolder, CreateFolderData } from '../types/documents.types';

const BASE = '/api/v1/document-folders';

export const foldersService = {
  getTree: () =>
    apiClient.get<ApiResponse<DocumentFolder[]>>(`${BASE}/tree`).then((r) => r.data),

  getContents: (id: string, page = 1, limit = 50) =>
    apiClient.get<ApiResponse<any>>(`${BASE}/${id}/contents`, { params: { page, limit } }).then((r) => r.data),

  create: (data: CreateFolderData) =>
    apiClient.post<ApiResponse<DocumentFolder>>(BASE, data).then((r) => r.data),

  update: (id: string, data: Partial<CreateFolderData>) =>
    apiClient.put<ApiResponse<DocumentFolder>>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data),
};
