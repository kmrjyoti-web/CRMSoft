import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  DocumentListItem, DocumentDetail, DocumentVersion, DocumentActivity,
  DocumentStats, DocumentUploadData, DocumentUpdateData, DocumentListParams, LinkCloudData,
} from '../types/documents.types';

const BASE = '/api/v1/documents';

export const documentsService = {
  getAll: (params?: DocumentListParams) =>
    apiClient.get<ApiResponse<DocumentListItem[]>>(BASE, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<DocumentDetail>>(`${BASE}/${id}`).then((r) => r.data),

  search: (params: DocumentListParams) =>
    apiClient.get<ApiResponse<DocumentListItem[]>>(`${BASE}/search`, { params }).then((r) => r.data),

  getStats: () =>
    apiClient.get<ApiResponse<DocumentStats>>(`${BASE}/stats`).then((r) => r.data),

  upload: (data: DocumentUploadData) => {
    const fd = new FormData();
    fd.append('file', data.file);
    if (data.category) fd.append('category', data.category);
    if (data.description) fd.append('description', data.description);
    if (data.tags) data.tags.forEach((t) => fd.append('tags[]', t));
    if (data.folderId) fd.append('folderId', data.folderId);
    return apiClient.post<ApiResponse<DocumentDetail>>(`${BASE}/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  linkCloud: (data: LinkCloudData) =>
    apiClient.post<ApiResponse<DocumentDetail>>(`${BASE}/link-cloud`, data).then((r) => r.data),

  update: (id: string, data: DocumentUpdateData) =>
    apiClient.put<ApiResponse<DocumentDetail>>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data),

  move: (id: string, folderId: string | null) =>
    apiClient.post<ApiResponse<DocumentDetail>>(`${BASE}/${id}/move`, { folderId }).then((r) => r.data),

  uploadVersion: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<ApiResponse<DocumentDetail>>(`${BASE}/${id}/versions`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getVersions: (id: string) =>
    apiClient.get<ApiResponse<DocumentVersion[]>>(`${BASE}/${id}/versions`).then((r) => r.data),

  getActivity: (id: string, page = 1, limit = 20) =>
    apiClient.get<ApiResponse<DocumentActivity[]>>(`${BASE}/${id}/activity`, { params: { page, limit } }).then((r) => r.data),
};
