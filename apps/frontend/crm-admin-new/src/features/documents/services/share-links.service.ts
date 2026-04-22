import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type { DocumentShareLink, CreateShareLinkData, DocumentListItem } from '../types/documents.types';

const SHARE_BASE = '/api/v1/document-shares';
const ATTACH_BASE = '/api/v1/document-attachments';

export const shareLinksService = {
  create: (documentId: string, data: CreateShareLinkData) =>
    apiClient.post<ApiResponse<DocumentShareLink>>(`${SHARE_BASE}/${documentId}`, data).then((r) => r.data),

  getForDocument: (documentId: string) =>
    apiClient.get<ApiResponse<DocumentShareLink[]>>(`${SHARE_BASE}/${documentId}/links`).then((r) => r.data),

  revoke: (linkId: string) =>
    apiClient.delete<ApiResponse<void>>(`${SHARE_BASE}/${linkId}`).then((r) => r.data),

  // Entity attachments
  attachToEntity: (documentId: string, entityType: string, entityId: string) =>
    apiClient.post<ApiResponse<void>>(ATTACH_BASE, { documentId, entityType, entityId }).then((r) => r.data),

  detachFromEntity: (documentId: string, entityType: string, entityId: string) =>
    apiClient.delete<ApiResponse<void>>(`${ATTACH_BASE}/${documentId}/${entityType}/${entityId}`).then((r) => r.data),

  getEntityDocuments: (entityType: string, entityId: string) =>
    apiClient.get<ApiResponse<DocumentListItem[]>>(`${ATTACH_BASE}/entity/${entityType}/${entityId}`).then((r) => r.data),
};
