"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shortcutsService } from "../services/shortcuts.service";
import type { UpsertOverrideDto, CreateCustomShortcutDto } from "../types/shortcuts.types";

export const SHORTCUTS_KEY = ["keyboard-shortcuts"];

export function useShortcuts() {
  return useQuery({
    queryKey: SHORTCUTS_KEY,
    queryFn: () => shortcutsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpsertShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertOverrideDto }) =>
      shortcutsService.upsertOverride(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHORTCUTS_KEY }),
  });
}

export function useRemoveShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shortcutsService.removeOverride(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHORTCUTS_KEY }),
  });
}

export function useResetAllShortcuts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shortcutsService.resetAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHORTCUTS_KEY }),
  });
}

export function useCreateCustomShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomShortcutDto) => shortcutsService.createCustom(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHORTCUTS_KEY }),
  });
}

// Admin
export function useAdminShortcuts() {
  return useQuery({
    queryKey: ["shortcuts-admin"],
    queryFn: () => shortcutsService.adminList(),
  });
}

export function useAdminSeedShortcuts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shortcutsService.adminSeed(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHORTCUTS_KEY });
      qc.invalidateQueries({ queryKey: ["shortcuts-admin"] });
    },
  });
}

export function useAdminToggleLock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lock }: { id: string; lock: boolean }) =>
      lock ? shortcutsService.adminLock(id) : shortcutsService.adminUnlock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shortcuts-admin"] }),
  });
}

export function useAdminUpdateShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { label?: string; defaultKey?: string; isLocked?: boolean; isActive?: boolean } }) =>
      shortcutsService.adminUpdate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shortcuts-admin"] }),
  });
}
