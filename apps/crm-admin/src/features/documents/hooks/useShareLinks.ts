import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { shareLinksService } from '../services/share-links.service';
import type { CreateShareLinkData } from '../types/documents.types';

const KEY = 'document-shares';

export function useDocumentShareLinks(documentId: string) {
  return useQuery({
    queryKey: [KEY, documentId],
    queryFn: () => shareLinksService.getForDocument(documentId),
    enabled: !!documentId,
  });
}

export function useCreateShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: CreateShareLinkData }) =>
      shareLinksService.create(documentId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRevokeShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => shareLinksService.revoke(linkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAttachDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, entityType, entityId }: { documentId: string; entityType: string; entityId: string }) =>
      shareLinksService.attachToEntity(documentId, entityType, entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entity-documents'] }),
  });
}

export function useDetachDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, entityType, entityId }: { documentId: string; entityType: string; entityId: string }) =>
      shareLinksService.detachFromEntity(documentId, entityType, entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entity-documents'] }),
  });
}

export function useEntityDocuments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['entity-documents', entityType, entityId],
    queryFn: () => shareLinksService.getEntityDocuments(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}
