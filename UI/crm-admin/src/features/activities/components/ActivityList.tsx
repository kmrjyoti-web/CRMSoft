"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { TableFull, Button, Icon, Switch } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useBulkOperations } from "@/hooks/useBulkOperations";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { BulkActionsBar } from "@/components/common/BulkActionsBar";
import { BulkEditPanel } from "@/components/common/BulkEditPanel";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { formatDate } from "@/lib/format-date";

import { useActivitiesList, useSoftDeleteActivity, useUpdateActivity, useDeactivateActivity, useReactivateActivity } from "../hooks/useActivities";

import { ACTIVITY_FILTER_CONFIG } from "../utils/activity-filters";

import type {
  ActivityListItem,
  ActivityListParams,
} from "../types/activities.types";

// -- Column definitions ------------------------------------------------------

const ACTIVITY_COLUMNS = [
  { id: "type", label: "Type", visible: true },
  { id: "subject", label: "Subject", visible: true },
  { id: "lead", label: "Lead", visible: true },
  { id: "contact", label: "Contact", visible: true },
  { id: "scheduledAt", label: "Scheduled At", visible: true },
  { id: "duration", label: "Duration", visible: true },
  { id: "active", label: "Active", visible: true },
  { id: "outcome", label: "Outcome", visible: false },
  { id: "createdAt", label: "Created", visible: false },
];

// -- Bulk edit fields --------------------------------------------------------

const BULK_EDIT_FIELDS = [
  {
    key: "type",
    label: "Type",
    type: "select" as const,
    options: [
      { label: "Call", value: "CALL" },
      { label: "Email", value: "EMAIL" },
      { label: "Meeting", value: "MEETING" },
      { label: "Note", value: "NOTE" },
      { label: "WhatsApp", value: "WHATSAPP" },
      { label: "SMS", value: "SMS" },
      { label: "Visit", value: "VISIT" },
    ],
  },
  { key: "subject", label: "Subject", type: "text" as const },
];

// -- Helpers -----------------------------------------------------------------

function flattenActivities(
  items: ActivityListItem[],
): Record<string, unknown>[] {
  return items.map((a) => ({
    id: a.id,
    type: a.type,
    subject: a.subject,
    lead: a.lead?.leadNumber ?? "—",
    contact: a.contact
      ? `${a.contact.firstName} ${a.contact.lastName}`
      : "—",
    scheduledAt: a.scheduledAt ? formatDate(a.scheduledAt) : "—",
    duration: a.duration != null ? `${a.duration} mins` : "—",
    outcome: a.outcome ?? "—",
    createdAt: a.createdAt
      ? new Date(a.createdAt).toLocaleDateString()
      : "—",
    _maskingMeta: (a as any)._maskingMeta,
  }));
}

// -- Component ---------------------------------------------------------------

export function ActivityList() {
  const router = useRouter();

  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteActivity();
  const updateMutation = useUpdateActivity();
  const deactivateMut = useDeactivateActivity();
  const reactivateMut = useReactivateActivity();
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
    useTableFilters(ACTIVITY_FILTER_CONFIG);

  const params = useMemo<ActivityListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useActivitiesList(params);

  const responseData = data?.data;
  const items: ActivityListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: ActivityListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("Activity deactivated");
        } else {
          await reactivateMut.mutateAsync(id);
          toast.success("Activity reactivated");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [deactivateMut, reactivateMut],
  );

  const tableData = useMemo(() => {
    const flat = flattenActivities(items);
    return flat.map((row, idx) => ({
      ...row,
      active: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={items[idx].isActive ?? true}
            onChange={() => handleToggleActive(row.id as string, items[idx].isActive ?? true)}
          />
        </div>
      ),
    }));
  }, [items, handleToggleActive]);

  // ── Bulk delete hook ────────────────────────────────────
  const selectedArray = Array.from(selectedIds);
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "activity",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/activities/${row.id}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/activities/new");
  }, [router]);

  // ── Single row delete ─────────────────────────────────────

  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Activity",
        message: `Move "${row.subject}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("Activity moved to recycle bin");
      } catch {
        toast.error("Failed to delete activity");
      }
    },
    [confirm, softDeleteMutation],
  );

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
        onClick: () => router.push("/activities/mass-update"),
      },
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/activities/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Activities" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Activities"
          tableKey="activities"
          columns={ACTIVITY_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={ACTIVITY_FILTER_CONFIG}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onRowEdit={handleRowEdit}
          onRowDelete={handleRowDelete}
          onCreate={handleCreate}
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
        entityName="activity"
      />

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="activity"
      />

      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
