import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { documentsService } from '../services/documents.service';
import type {
  DocumentListParams, DocumentUploadData, DocumentUpdateData, LinkCloudData,
} from '../types/documents.types';

const KEY = 'documents';

export function useDocumentsList(params?: DocumentListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => documentsService.getAll(params),
  });
}

export function useDocumentDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => documentsService.getById(id),
    enabled: !!id,
  });
}

export function useDocumentSearch(params: DocumentListParams) {
  return useQuery({
    queryKey: [KEY, 'search', params],
    queryFn: () => documentsService.search(params),
    enabled: !!params.search,
  });
}

export function useDocumentStats() {
  return useQuery({
    queryKey: [KEY, 'stats'],
    queryFn: () => documentsService.getStats(),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentUploadData) => documentsService.upload(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['document-folders'] });
    },
  });
}

export function useLinkCloudDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LinkCloudData) => documentsService.linkCloud(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdateData }) =>
      documentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['document-folders'] });
    },
  });
}

export function useMoveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      documentsService.move(id, folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['document-folders'] });
    },
  });
}

export function useUploadVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      documentsService.uploadVersion(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDocumentVersions(id: string) {
  return useQuery({
    queryKey: [KEY, id, 'versions'],
    queryFn: () => documentsService.getVersions(id),
    enabled: !!id,
  });
}

export function useDocumentActivity(id: string, page = 1) {
  return useQuery({
    queryKey: [KEY, id, 'activity', page],
    queryFn: () => documentsService.getActivity(id, page),
    enabled: !!id,
  });
}
