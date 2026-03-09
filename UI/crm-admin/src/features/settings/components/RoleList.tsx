"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useRolesList } from "../hooks/useRoles";
import { RoleForm } from "./RoleForm";

import type { RoleListItem } from "../types/settings.types";

// ── Column definitions ──────────────────────────────────

const ROLE_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "displayName", label: "Display Name", visible: true },
  { id: "description", label: "Description", visible: true },
  { id: "level", label: "Level", visible: true },
  { id: "users", label: "Users", visible: true },
  { id: "type", label: "Type", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// ── Helpers ─────────────────────────────────────────────

function flattenRoles(roles: RoleListItem[]): Record<string, unknown>[] {
  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    displayName: r.displayName,
    description: r.description ?? "—",
    level: r.level,
    users: r._count?.users ?? 0,
    type: r.isSystem ? "System" : "Custom",
    createdAt: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString("en-IN")
      : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function RoleList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "role",
    entityLabel: "Role",
    FormComponent: RoleForm,
    idProp: "roleId",
    editRoute: "/settings/roles/:id/edit",
    createRoute: "/settings/roles/new",
    displayField: "name",
  });

  const { data, isLoading } = useRolesList();

  const roles: RoleListItem[] = useMemo(() => {
    const raw = data?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: RoleListItem[] };
    return nested?.data ?? [];
  }, [data]);

  const tableData = useMemo(() => flattenRoles(roles), [roles]);

  if (isLoading) return <TableSkeleton title="Roles & Permissions" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Roles & Permissions"
        columns={ROLE_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
