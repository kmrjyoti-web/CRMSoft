import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { foldersService } from '../services/folders.service';
import type { CreateFolderData } from '../types/documents.types';

const KEY = 'document-folders';

export function useFolderTree() {
  return useQuery({
    queryKey: [KEY, 'tree'],
    queryFn: () => foldersService.getTree(),
  });
}

export function useFolderContents(id: string, page = 1) {
  return useQuery({
    queryKey: [KEY, id, 'contents', page],
    queryFn: () => foldersService.getContents(id, page),
    enabled: !!id,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFolderData) => foldersService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFolderData> }) =>
      foldersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
