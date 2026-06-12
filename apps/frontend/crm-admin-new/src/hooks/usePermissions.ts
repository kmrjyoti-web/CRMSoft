import { useMemo } from "react";

import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permission.store";

// ── usePermissions Hook ─────────────────────────────────
// Returns granular CRUD permission booleans for a given menu/module key.
// Usage: const { canView, canCreate, canEdit, canDelete } = usePermissions("leads");
//
// Backend permission codes follow the pattern "module:action"
// where action is one of: read, create, update, delete, export, import

export interface MenuPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
}

const ALL_GRANTED: MenuPermissions = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
  canImport: true,
};

const NONE_GRANTED: MenuPermissions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
  canImport: false,
};

/**
 * Returns permission flags for a given module key.
 * SuperAdmin always gets full access.
 * If permissions haven't loaded yet, defaults to view-only (safe fallback).
 *
 * @param moduleKey - The permission module (e.g. "leads", "contacts", "finance")
 */
export function usePermissions(moduleKey: string): MenuPermissions {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const codes = usePermissionStore((s) => s.codes);
  const loaded = usePermissionStore((s) => s.loaded);

  return useMemo(() => {
    // SuperAdmin bypasses all checks
    if (isSuperAdmin) return ALL_GRANTED;

    // Permissions not yet loaded — safe fallback
    if (!loaded) return NONE_GRANTED;

    return {
      canView: codes.includes(`${moduleKey}:read`),
      canCreate: codes.includes(`${moduleKey}:create`),
      canEdit: codes.includes(`${moduleKey}:update`),
      canDelete: codes.includes(`${moduleKey}:delete`),
      canExport: codes.includes(`${moduleKey}:export`),
      canImport: codes.includes(`${moduleKey}:import`),
    };
  }, [isSuperAdmin, codes, loaded, moduleKey]);
}

export default usePermissions;
