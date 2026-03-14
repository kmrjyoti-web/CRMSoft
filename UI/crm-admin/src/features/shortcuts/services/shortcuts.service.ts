import api from "@/services/api-client";
import type { ShortcutDefinition, ConflictCheckResult, UpsertOverrideDto, CreateCustomShortcutDto } from "../types/shortcuts.types";

const BASE = "/api/v1/keyboard-shortcuts";

function unwrap<T>(res: any): T {
  return res?.data?.data ?? res?.data ?? res;
}

export const shortcutsService = {
  getAll: () => api.get<any>(BASE).then(unwrap<ShortcutDefinition[]>),
  upsertOverride: (shortcutId: string, dto: UpsertOverrideDto) =>
    api.put<any>(`${BASE}/${shortcutId}/override`, dto).then(unwrap),
  removeOverride: (shortcutId: string) =>
    api.delete<any>(`${BASE}/${shortcutId}/override`).then(unwrap),
  resetAll: () =>
    api.delete<any>(`${BASE}/overrides/all`).then(unwrap),
  createCustom: (dto: CreateCustomShortcutDto) =>
    api.post<any>(`${BASE}/custom`, dto).then(unwrap),
  checkConflict: (key: string, excludeShortcutId?: string) =>
    api.post<any>(`${BASE}/check-conflict`, { key, excludeShortcutId }).then(unwrap<ConflictCheckResult>),

  // Admin
  adminList: () => api.get<any>(`${BASE}/admin`).then(unwrap),
  adminSeed: () => api.post<any>(`${BASE}/admin/seed`).then(unwrap),
  adminLock: (id: string) => api.put<any>(`${BASE}/admin/${id}/lock`).then(unwrap),
  adminUnlock: (id: string) => api.put<any>(`${BASE}/admin/${id}/unlock`).then(unwrap),
  adminUpdate: (id: string, dto: { label?: string; defaultKey?: string; isLocked?: boolean; isActive?: boolean }) =>
    api.put<any>(`${BASE}/admin/${id}`, dto).then(unwrap),
};
