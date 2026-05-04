'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsApi } from '@/lib/api/versions';
import type { CreateVersionDto, CreatePatchDto, VersionFilters } from '@/types/version';

export function useVersions(filters?: VersionFilters) {
  return useQuery({
    queryKey: ['versions', filters],
    queryFn: () => versionsApi.list(filters),
  });
}

export function useVersion(id: string) {
  return useQuery({
    queryKey: ['version', id],
    queryFn: () => versionsApi.getById(id),
    enabled: !!id,
  });
}

export function useVersionStats() {
  return useQuery({
    queryKey: ['version-stats'],
    queryFn: () => versionsApi.getStats(),
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVersionDto) => versionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions'] }),
  });
}

export function useUpdateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVersionDto> }) =>
      versionsApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['versions'] });
      qc.invalidateQueries({ queryKey: ['version', vars.id] });
    },
  });
}

export function usePublishVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => versionsApi.publish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['versions'] });
      qc.invalidateQueries({ queryKey: ['version', id] });
      qc.invalidateQueries({ queryKey: ['version-stats'] });
    },
  });
}

export function useRollbackVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      versionsApi.rollback(id, reason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['versions'] });
      qc.invalidateQueries({ queryKey: ['version', vars.id] });
      qc.invalidateQueries({ queryKey: ['version-stats'] });
    },
  });
}

// Patches
export function useVersionPatches(versionId: string, params?: { industryCode?: string; status?: string }) {
  return useQuery({
    queryKey: ['version-patches', versionId, params],
    queryFn: () => versionsApi.listPatches(versionId, params),
    enabled: !!versionId,
  });
}

export function useCreatePatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, data }: { versionId: string; data: CreatePatchDto }) =>
      versionsApi.createPatch(versionId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['version-patches', vars.versionId] });
      qc.invalidateQueries({ queryKey: ['version', vars.versionId] });
    },
  });
}

export function useApplyPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patchId: string) => versionsApi.applyPatch(patchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['version-patches'] });
      qc.invalidateQueries({ queryKey: ['versions'] });
    },
  });
}

export function useRollbackPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patchId: string) => versionsApi.rollbackPatch(patchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['version-patches'] });
    },
  });
}

// Backups
export function useVersionBackups(versionId: string, params?: { backupType?: string }) {
  return useQuery({
    queryKey: ['version-backups', versionId, params],
    queryFn: () => versionsApi.listBackups(versionId, params),
    enabled: !!versionId,
  });
}

export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, data }: { versionId: string; data?: { backupType?: string } }) =>
      versionsApi.createBackup(versionId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['version-backups', vars.versionId] });
    },
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (backupId: string) => versionsApi.restoreBackup(backupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['version-backups'] });
      qc.invalidateQueries({ queryKey: ['versions'] });
    },
  });
}

export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (backupId: string) => versionsApi.deleteBackup(backupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['version-backups'] });
    },
  });
}

// Notion
export function usePublishToNotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => versionsApi.publishToNotion(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['version', id] });
    },
  });
}

export function useNotionStatus() {
  return useQuery({
    queryKey: ['notion-status'],
    queryFn: () => versionsApi.notionStatus(),
  });
}
