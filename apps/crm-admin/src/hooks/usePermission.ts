import { usePermissionStore } from "@/stores/permission.store";

// ── Single permission check ────────────────────────────

export function usePermission(code: string): boolean {
  return usePermissionStore((s) => s.codes.includes(code));
}

// ── Full permission store access ───────────────────────

export function usePermissions() {
  return usePermissionStore();
}
