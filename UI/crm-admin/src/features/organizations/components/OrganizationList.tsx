"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { TableFull, Button, Icon, Switch } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useBulkOperations } from "@/hooks/useBulkOperations";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { BulkActionsBar } from "@/components/common/BulkActionsBar";
import { BulkEditPanel } from "@/components/common/BulkEditPanel";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";

import {
  useOrganizationsList,
  useSoftDeleteOrganization,
  useUpdateOrganization,
  useDeactivateOrganization,
  useReactivateOrganization,
} from "../hooks/useOrganizations";

import { ORGANIZATION_FILTER_CONFIG } from "../utils/organization-filters";

import type {
  OrganizationListItem,
  OrganizationListParams,
} from "../types/organizations.types";

// -- Column definitions -----------------------------------------------------

const ORGANIZATION_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "industry", label: "Industry", visible: true },
  { id: "city", label: "City", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "website", label: "Website", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

// -- Bulk edit fields --------------------------------------------------------

const BULK_EDIT_FIELDS = [
  { key: "industry", label: "Industry", type: "text" as const },
  { key: "city", label: "City", type: "text" as const },
  { key: "country", label: "Country", type: "text" as const },
];

// -- Helpers ----------------------------------------------------------------

function flattenOrganizations(
  orgs: OrganizationListItem[],
): Record<string, unknown>[] {
  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
    industry: org.industry ?? "—",
    city: org.city ?? "—",
    phone: org.phone ?? "—",
    website: org.website ?? "—",
    status: org.isActive ? "Active" : "Inactive",
    createdAt: org.createdAt
      ? new Date(org.createdAt).toLocaleDateString()
      : "—",
    _maskingMeta: (org as any)._maskingMeta,
  }));
}

// -- Component --------------------------------------------------------------

export function OrganizationList() {
  const router = useRouter();

  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteOrganization();
  const updateMutation = useUpdateOrganization();
  const deactivateMut = useDeactivateOrganization();
  const reactivateMut = useReactivateOrganization();
  const { execute: bulkExecute } = useBulkOperations();

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
    useTableFilters(ORGANIZATION_FILTER_CONFIG);

  const params = useMemo<OrganizationListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useOrganizationsList(params);

  const responseData = data?.data;
  const organizations: OrganizationListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as {
      data?: OrganizationListItem[];
    };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("Organization deactivated");
        } else {
          await reactivateMut.mutateAsync(id);
          toast.success("Organization reactivated");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [deactivateMut, reactivateMut],
  );

  const tableData = useMemo(() => {
    const flat = flattenOrganizations(organizations);
    return flat.map((row, idx) => ({
      ...row,
      status: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={organizations[idx].isActive}
            onChange={() => handleToggleActive(row.id as string, organizations[idx].isActive)}
          />
        </div>
      ),
    }));
  }, [organizations, handleToggleActive]);

  // ── Bulk delete hook ────────────────────────────────────
  const selectedArray = Array.from(selectedIds);
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "organization",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  // ── Single row archive ────────────────────────────────────

  const handleRowArchive = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Organization",
        message: `Move "${row.name}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("Organization moved to recycle bin");
      } catch {
        toast.error("Failed to delete organization");
      }
    },
    [confirm, softDeleteMutation],
  );

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/organizations/${row.id}/edit`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/organizations/new");
  }, [router]);

  // ── Bulk edit handlers ─────────────────────────────────────

  const handleBulkEditSubmit = useCallback(
    async (ids: string[], values: Record<string, unknown>) => {
      await bulkExecute(ids, (id) =>
        updateMutation.mutateAsync({ id, data: values as any }),
      );
      clearSelection();
    },
    [bulkExecute, updateMutation, clearSelection],
  );

  // ── Actions menu items ─────────────────────────────────────

  const actionsMenuItems = useMemo(
    () => [
      {
        label: "Mass Update",
        icon: "edit-3",
        onClick: () => router.push("/organizations/mass-update"),
      },
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/organizations/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Organizations" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Organizations"
          tableKey="organizations"
          columns={ORGANIZATION_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={ORGANIZATION_FILTER_CONFIG}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onRowEdit={handleRowEdit}
          onCreate={handleCreate}
          onRowDelete={handleRowArchive}
          onRowArchive={handleRowArchive}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          headerActions={<ActionsMenu items={actionsMenuItems} />}
        />
      </div>

      {/* Floating bulk actions bar */}
      <BulkActionsBar
        count={selectionCount}
        onEdit={() => setBulkEditOpen(true)}
        onDelete={() => triggerBulkDelete()}
        onClear={clearSelection}
        entityName="organization"
      />

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="organization"
      />

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
