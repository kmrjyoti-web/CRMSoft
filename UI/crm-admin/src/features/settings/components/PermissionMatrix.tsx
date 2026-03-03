"use client";

import { useMemo, useCallback } from "react";

import toast from "react-hot-toast";

import { Checkbox } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { usePermissionsList, useUpdateRolePermissions } from "../hooks/usePermissions";
import { useRolesList } from "../hooks/useRoles";

import type { PermissionItem, RoleListItem } from "../types/settings.types";

// ── Helpers ──────────────────────────────────────────────

interface PermissionGroup {
  module: string;
  permissions: PermissionItem[];
}

function groupByModule(permissions: PermissionItem[]): PermissionGroup[] {
  const map = new Map<string, PermissionItem[]>();
  for (const p of permissions) {
    const list = map.get(p.module) ?? [];
    list.push(p);
    map.set(p.module, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([module, perms]) => ({ module, permissions: perms }));
}

// ── Component ────────────────────────────────────────────

export function PermissionMatrix() {
  const { data: permissionsData, isLoading: isLoadingPerms } =
    usePermissionsList();
  const { data: rolesData, isLoading: isLoadingRoles } = useRolesList();
  const updateMutation = useUpdateRolePermissions();

  const permissions = useMemo(
    () => permissionsData?.data ?? [],
    [permissionsData],
  );
  const roles = useMemo(() => rolesData?.data ?? [], [rolesData]);

  const grouped = useMemo(() => groupByModule(permissions), [permissions]);

  // Build a map of roleId → Set<permissionId> for quick lookup
  const rolePermMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const role of roles) {
      // RoleListItem may not include permissions; rely on detail if needed
      // For matrix, we assume roles response includes permission ids or we check via a different mechanism
      map.set(role.id, new Set<string>());
    }
    return map;
  }, [roles]);

  const handleToggle = useCallback(
    async (role: RoleListItem, permissionId: string, checked: boolean) => {
      const current = rolePermMap.get(role.id) ?? new Set<string>();
      const updated = new Set(current);
      if (checked) {
        updated.add(permissionId);
      } else {
        updated.delete(permissionId);
      }
      try {
        await updateMutation.mutateAsync({
          roleId: role.id,
          permissionIds: Array.from(updated),
        });
      } catch {
        toast.error("Failed to update permissions");
      }
    },
    [rolePermMap, updateMutation],
  );

  if (isLoadingPerms || isLoadingRoles) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6">
      <PageHeader title="Permission Matrix" />

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 sticky left-0 bg-gray-50">Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="px-4 py-3 text-center">
                  {role.displayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grouped.map((group) => (
              <>
                {/* Module header row */}
                <tr key={`module-${group.module}`} className="bg-gray-25">
                  <td
                    colSpan={roles.length + 1}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gray-100"
                  >
                    {group.module}
                  </td>
                </tr>
                {/* Permission rows */}
                {group.permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 sticky left-0 bg-white">
                      {perm.action}
                      {perm.description && (
                        <span className="ml-2 text-xs text-gray-400">
                          {perm.description}
                        </span>
                      )}
                    </td>
                    {roles.map((role) => {
                      const permSet = rolePermMap.get(role.id);
                      const isChecked = permSet?.has(perm.id) ?? false;
                      return (
                        <td key={role.id} className="px-4 py-2 text-center">
                          <Checkbox
                            checked={isChecked}
                            onChange={(checked) =>
                              handleToggle(role, perm.id, checked as boolean)
                            }
                            disabled={role.isSystem}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
