"use client";

import { useState, useMemo, useCallback } from "react";

import toast from "react-hot-toast";

import { Icon, Badge, Checkbox } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  usePermissionsList,
  usePermissionMatrix,
  useUpdateRolePermissions,
} from "../hooks/usePermissions";
import { useRolesList } from "../hooks/useRoles";

import type { PermissionItem, RoleListItem } from "../types/settings.types";

// ── Constants ────────────────────────────────────────────

const ACTIONS = ["create", "read", "update", "delete", "export"] as const;

const ACTION_ICONS: Record<string, string> = {
  create: "plus-circle",
  read: "eye",
  update: "pencil",
  delete: "trash-2",
  export: "download",
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-green-600",
  read: "text-blue-600",
  update: "text-amber-600",
  delete: "text-red-600",
  export: "text-purple-600",
};

const MODULE_ICONS: Record<string, string> = {
  contacts: "users",
  raw_contacts: "user-plus",
  organizations: "building-2",
  leads: "target",
  activities: "activity",
  demos: "presentation",
  "tour-plans": "map-pin",
  quotations: "file-text",
  invoices: "receipt",
  payments: "credit-card",
  installations: "wrench",
  trainings: "graduation-cap",
  licenses: "key",
  ledgers: "book-open",
  "support-tickets": "life-buoy",
  communications: "mail",
  users: "user",
  roles: "shield",
  lookups: "list",
  ownership: "lock",
  reports: "bar-chart-3",
  departments: "layers",
  designations: "award",
  brands: "tag",
  manufacturers: "factory",
  packages: "package",
  locations: "map",
  menus: "menu",
  custom_fields: "settings-2",
  products: "box",
  product_pricing: "dollar-sign",
  workflows: "git-branch",
  "follow-ups": "phone-forwarded",
  reminders: "bell",
  recurrence: "repeat",
  calendar: "calendar",
  dashboard: "home",
  analytics: "trending-up",
  performance: "gauge",
  audit: "clipboard-list",
  settings: "settings",
  wallet: "wallet",
  notifications: "bell-ring",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#6366f1",
  ADMIN: "#3b82f6",
  MANAGER: "#8b5cf6",
  TEAM_LEAD: "#a855f7",
  SALES_EXECUTIVE: "#06b6d4",
  SR_SALES_EXECUTIVE: "#0891b2",
  FIELD_SALES: "#14b8a6",
  TELECALLER: "#10b981",
  MARKETING_STAFF: "#f59e0b",
  SUPPORT_AGENT: "#ef4444",
  ACCOUNT_MANAGER: "#ec4899",
  DATA_ENTRY: "#64748b",
  APPROVER: "#f97316",
  VIEWER: "#94a3b8",
};

// ── Helpers ──────────────────────────────────────────────

interface ModuleGroup {
  module: string;
  permissions: PermissionItem[];
}

function groupByModule(permissions: PermissionItem[]): ModuleGroup[] {
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

function formatModuleName(module: string): string {
  return module
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ────────────────────────────────────────────

export function PermissionMatrix() {
  const { data: permissionsData, isLoading: isLoadingPerms } =
    usePermissionsList();
  const { data: matrixData, isLoading: isLoadingMatrix } =
    usePermissionMatrix();
  const { data: rolesData, isLoading: isLoadingRoles } = useRolesList();
  const updateMutation = useUpdateRolePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Unwrap API response
  const permissions: PermissionItem[] = useMemo(() => {
    const raw = (permissionsData as any)?.data ?? permissionsData;
    return Array.isArray(raw) ? raw : [];
  }, [permissionsData]);

  const roles: RoleListItem[] = useMemo(() => {
    const raw = (rolesData as any)?.data ?? rolesData;
    return Array.isArray(raw) ? raw : [];
  }, [rolesData]);

  // Matrix: roleId → Set<permissionId>
  const rolePermMap = useMemo(() => {
    const raw = (matrixData as any)?.data ?? matrixData ?? {};
    const map = new Map<string, Set<string>>();
    if (typeof raw === "object" && raw !== null) {
      for (const [roleId, permIds] of Object.entries(raw)) {
        map.set(roleId, new Set(permIds as string[]));
      }
    }
    for (const role of roles) {
      if (!map.has(role.id)) map.set(role.id, new Set());
    }
    return map;
  }, [matrixData, roles]);

  const grouped = useMemo(() => groupByModule(permissions), [permissions]);

  // Active role
  const activeRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId],
  );

  const activePermSet = useMemo(
    () => (activeRole ? rolePermMap.get(activeRole.id) ?? new Set<string>() : new Set<string>()),
    [activeRole, rolePermMap],
  );

  // Count total assigned permissions per role
  const rolePermCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const role of roles) {
      counts.set(role.id, rolePermMap.get(role.id)?.size ?? 0);
    }
    return counts;
  }, [roles, rolePermMap]);

  // ── Toggle a single permission ──

  const handleToggle = useCallback(
    async (permissionId: string, checked: boolean) => {
      if (!activeRole) return;
      const updated = new Set(activePermSet);
      if (checked) {
        updated.add(permissionId);
      } else {
        updated.delete(permissionId);
      }
      try {
        await updateMutation.mutateAsync({
          roleId: activeRole.id,
          permissionIds: Array.from(updated),
        });
        toast.success("Permission updated");
      } catch {
        toast.error("Failed to update permissions");
      }
    },
    [activeRole, activePermSet, updateMutation],
  );

  // ── Toggle all actions for a module ──

  const handleToggleModule = useCallback(
    async (group: ModuleGroup, grantAll: boolean) => {
      if (!activeRole) return;
      const updated = new Set(activePermSet);
      for (const perm of group.permissions) {
        if (grantAll) updated.add(perm.id);
        else updated.delete(perm.id);
      }
      try {
        await updateMutation.mutateAsync({
          roleId: activeRole.id,
          permissionIds: Array.from(updated),
        });
        toast.success("Permissions updated");
      } catch {
        toast.error("Failed to update permissions");
      }
    },
    [activeRole, activePermSet, updateMutation],
  );

  // ── Toggle one action column across all modules ──

  const handleToggleActionColumn = useCallback(
    async (action: string, grantAll: boolean) => {
      if (!activeRole) return;
      const updated = new Set(activePermSet);
      for (const group of grouped) {
        const perm = group.permissions.find((p) => p.action === action);
        if (perm) {
          if (grantAll) updated.add(perm.id);
          else updated.delete(perm.id);
        }
      }
      try {
        await updateMutation.mutateAsync({
          roleId: activeRole.id,
          permissionIds: Array.from(updated),
        });
        toast.success("Permissions updated");
      } catch {
        toast.error("Failed to update permissions");
      }
    },
    [activeRole, activePermSet, grouped, updateMutation],
  );

  // ── Toggle ALL permissions ──

  const handleToggleAll = useCallback(
    async (grantAll: boolean) => {
      if (!activeRole) return;
      const updated = grantAll
        ? new Set(permissions.map((p) => p.id))
        : new Set<string>();
      try {
        await updateMutation.mutateAsync({
          roleId: activeRole.id,
          permissionIds: Array.from(updated),
        });
        toast.success(grantAll ? "All permissions granted" : "All permissions revoked");
      } catch {
        toast.error("Failed to update permissions");
      }
    },
    [activeRole, permissions, updateMutation],
  );

  if (isLoadingPerms || isLoadingRoles || isLoadingMatrix)
    return <LoadingSpinner fullPage />;

  // Column-level check counts
  const actionColumnChecked = (action: string) => {
    let checked = 0;
    let total = 0;
    for (const group of grouped) {
      const perm = group.permissions.find((p) => p.action === action);
      if (perm) {
        total++;
        if (activePermSet.has(perm.id)) checked++;
      }
    }
    return { checked, total };
  };

  const totalChecked = activePermSet.size;
  const totalPerms = permissions.length;
  const allGranted = totalChecked === totalPerms && totalPerms > 0;

  return (
    <div className="p-6">
      <PageHeader
        title="Permissions"
        subtitle="Select a role to manage its module permissions"
      />

      <div className="mt-4 flex gap-6" style={{ minHeight: 500 }}>
        {/* ── Left Panel: Roles List ── */}
        <div
          className="w-60 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden"
          style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        >
          <div className="px-3 py-2 bg-gray-50 border-b text-xs font-semibold uppercase text-gray-500">
            Roles ({roles.length})
          </div>
          {roles.map((role) => {
            const isActive = role.id === (activeRole?.id ?? null);
            const count = rolePermCounts.get(role.id) ?? 0;
            const color = ROLE_COLORS[role.name] ?? "#6b7280";

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors border-b border-gray-100 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={isActive ? { borderLeft: "3px solid #3b82f6" } : {}}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {role.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{role.displayName}</div>
                  {role.isSystem && (
                    <span className="text-[9px] text-indigo-400 uppercase font-semibold">
                      System
                    </span>
                  )}
                </div>
                <Badge
                  variant={isActive ? "primary" : "default"}
                  style={{ fontSize: 10, padding: "1px 6px" }}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* ── Right Panel: Module × Action Table ── */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          {activeRole ? (
            <>
              {/* Role header */}
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        ROLE_COLORS[activeRole.name] ?? "#6b7280",
                    }}
                  >
                    {activeRole.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {activeRole.displayName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeRole.description ?? activeRole.name} &middot;{" "}
                      {totalChecked}/{totalPerms} permissions
                    </p>
                  </div>
                </div>
                {!activeRole.isSystem && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Grant All</span>
                    <Checkbox
                      checked={allGranted}
                      onChange={() => handleToggleAll(!allGranted)}
                    />
                  </div>
                )}
              </div>

              {/* Table */}
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 280px)" }}
              >
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-56">
                        Module
                      </th>
                      {ACTIONS.map((action) => {
                        const { checked, total } = actionColumnChecked(action);
                        const colAllChecked = checked === total && total > 0;

                        return (
                          <th key={action} className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1.5">
                                <Icon
                                  name={ACTION_ICONS[action] as any}
                                  size={14}
                                  className={ACTION_COLORS[action]}
                                />
                                <span className="text-xs font-semibold uppercase text-gray-600">
                                  {action}
                                </span>
                              </div>
                              {!activeRole.isSystem && (
                                <Checkbox
                                  checked={colAllChecked}
                                  onChange={() =>
                                    handleToggleActionColumn(
                                      action,
                                      !colAllChecked,
                                    )
                                  }
                                />
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                        All
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grouped.map((group) => {
                      const checkedInModule = group.permissions.filter((p) =>
                        activePermSet.has(p.id),
                      ).length;
                      const moduleAllChecked =
                        checkedInModule === group.permissions.length &&
                        group.permissions.length > 0;
                      const iconName = MODULE_ICONS[group.module] ?? "circle";

                      return (
                        <tr
                          key={group.module}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Icon
                                name={iconName as any}
                                size={16}
                                className="text-gray-400"
                              />
                              <span className="font-medium text-gray-900">
                                {formatModuleName(group.module)}
                              </span>
                              {checkedInModule > 0 && (
                                <span className="text-[10px] text-gray-400">
                                  {checkedInModule}/{group.permissions.length}
                                </span>
                              )}
                            </div>
                          </td>
                          {ACTIONS.map((action) => {
                            const perm = group.permissions.find(
                              (p) => p.action === action,
                            );
                            if (!perm) {
                              return (
                                <td
                                  key={action}
                                  className="px-3 py-3 text-center text-gray-300"
                                >
                                  &mdash;
                                </td>
                              );
                            }
                            const isChecked = activePermSet.has(perm.id);

                            return (
                              <td
                                key={action}
                                className="px-3 py-3 text-center"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(checked) =>
                                    handleToggle(perm.id, checked as boolean)
                                  }
                                  disabled={activeRole.isSystem}
                                />
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center">
                            <Checkbox
                              checked={moduleAllChecked}
                              onChange={() =>
                                handleToggleModule(group, !moduleAllChecked)
                              }
                              disabled={activeRole.isSystem}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Icon
                  name="shield"
                  size={48}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="text-sm">Select a role to view permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
