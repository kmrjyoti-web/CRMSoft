"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { TableFull, Button, Icon, Switch } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { BulkActionsBar } from "@/components/common/BulkActionsBar";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { HelpButton } from "@/components/common/HelpButton";

import { useUsersList, useSoftDeleteUser, useDeactivateUser, useActivateUser } from "../hooks/useUsers";

import { UserForm } from "./UserForm";
import { UserListUserHelp } from "../help/UserListUserHelp";
import { SettingsDevHelp } from "../help/SettingsDevHelp";

import { USER_FILTER_CONFIG } from "../utils/user-filters";

import type { UserListItem, UserListParams } from "../types/settings.types";

// ── Column definitions ──────────────────────────────────

const USER_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "role", label: "Role", visible: true },
  { id: "userType", label: "Type", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// ── Helpers ─────────────────────────────────────────────

function flattenUsers(users: UserListItem[]): Record<string, unknown>[] {
  return users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone ?? "—",
    role: u.role?.displayName ?? "—",
    userType: u.userType,
    status: u.status,
    createdAt: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString()
      : "—",
    _maskingMeta: (u as any)._maskingMeta,
  }));
}

// ── Component ───────────────────────────────────────────

export function UserList() {
  const router = useRouter();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "user",
    entityLabel: "User",
    FormComponent: UserForm,
    idProp: "userId",
    editRoute: "/settings/users/:id/edit",
    createRoute: "/settings/users/new",
    displayField: "name",
  });

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteUser();
  const deactivateMut = useDeactivateUser();
  const activateMut = useActivateUser();

  // Row selection
  const {
    selectedIds,
    toggle,
    selectAll,
    clearSelection,
    count: selectionCount,
  } = useBulkSelect();

  const handleSelectionChange = useCallback(
    (ids: Set<string>) => {
      clearSelection();
      selectAll(Array.from(ids));
    },
    [clearSelection, selectAll],
  );

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(USER_FILTER_CONFIG);

  const params = useMemo<UserListParams>(
    () => ({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useUsersList(params);

  const responseData = data?.data;
  const users: UserListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: UserListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      if (togglingId) return;
      setTogglingId(id);
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("User deactivated");
        } else {
          await activateMut.mutateAsync(id);
          toast.success("User activated");
        }
      } catch {
        toast.error("Failed to update status");
      } finally {
        setTogglingId(null);
      }
    },
    [deactivateMut, activateMut, togglingId],
  );

  const tableData = useMemo(() => {
    const flat = flattenUsers(users);
    return flat.map((row, idx) => ({
      ...row,
      status: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={users[idx].status === "ACTIVE"}
            onChange={() => handleToggleActive(row.id as string, users[idx].status === "ACTIVE")}
            disabled={togglingId === row.id}
          />
        </div>
      ),
    }));
  }, [users, handleToggleActive, togglingId]);

  // ── Bulk deactivate hook ──────────────────────────────────
  const selectedArray = Array.from(selectedIds);
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "user",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  // ── Single row archive ────────────────────────────────────

  const handleRowArchive = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete User",
        message: `Move "${row.name}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("User moved to recycle bin");
      } catch {
        toast.error("Failed to delete user");
      }
    },
    [confirm, softDeleteMutation],
  );

  // ── Actions menu items ─────────────────────────────────────

  const actionsMenuItems = useMemo(
    () => [
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/settings/users/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Users" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, unknown>[]}
          title="Users"
          tableKey="users"
          columns={USER_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={USER_FILTER_CONFIG}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onRowEdit={handleRowEdit}
          onCreate={handleCreate}
          onRowDelete={handleRowArchive}
          onRowArchive={handleRowArchive}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          headerActions={
            <>
              <HelpButton
                panelId="users-list-help"
                title="Users — Help"
                userContent={<UserListUserHelp />}
                devContent={<SettingsDevHelp />}
              />
              <ActionsMenu items={actionsMenuItems} />
            </>
          }
        />
      </div>

      {/* Floating bulk actions bar — delete only (no bulk edit for users) */}
      <BulkActionsBar
        count={selectionCount}
        onDelete={() => triggerBulkDelete()}
        onClear={clearSelection}
        entityName="user"
      />

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
