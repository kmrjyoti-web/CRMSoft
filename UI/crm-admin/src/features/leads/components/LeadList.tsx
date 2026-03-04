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

import { useLeadsList, useUpdateLead, useSoftDeleteLead, useDeactivateLead, useReactivateLead } from "../hooks/useLeads";

import { LEAD_FILTER_CONFIG } from "../utils/lead-filters";

import type {
  LeadListItem,
  LeadListParams,
} from "../types/leads.types";

// ── Column definitions ──────────────────────────────────

const LEAD_COLUMNS = [
  { id: "leadNumber", label: "Lead #", visible: true },
  { id: "contactName", label: "Contact", visible: true },
  { id: "organization", label: "Organization", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "priority", label: "Priority", visible: true },
  { id: "active", label: "Active", visible: true },
  { id: "allocatedTo", label: "Assignee", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

// ── Bulk edit fields ────────────────────────────────────

const BULK_EDIT_FIELDS = [
  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    options: [
      { label: "Low", value: "LOW" },
      { label: "Medium", value: "MEDIUM" },
      { label: "High", value: "HIGH" },
      { label: "Urgent", value: "URGENT" },
    ],
  },
  { key: "expectedCloseDate", label: "Expected Close Date", type: "date" as const },
];

// ── Helpers ─────────────────────────────────────────────

function flattenLeads(leads: LeadListItem[]): Record<string, unknown>[] {
  return leads.map((lead) => ({
    id: lead.id,
    leadNumber: lead.leadNumber,
    contactName: `${lead.contact.firstName} ${lead.contact.lastName}`,
    organization: lead.organization?.name ?? "—",
    status: lead.status,
    priority: lead.priority,
    allocatedTo: lead.allocatedTo
      ? `${lead.allocatedTo.firstName} ${lead.allocatedTo.lastName}`
      : "—",
    createdAt: lead.createdAt
      ? new Date(lead.createdAt).toLocaleDateString()
      : "—",
    _maskingMeta: (lead as any)._maskingMeta,
  }));
}

// ── Component ───────────────────────────────────────────

export function LeadList() {
  const router = useRouter();

  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteLead();
  const updateMutation = useUpdateLead();
  const deactivateMut = useDeactivateLead();
  const reactivateMut = useReactivateLead();
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
    useTableFilters(LEAD_FILTER_CONFIG);

  const params = useMemo<LeadListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useLeadsList(params);

  const responseData = data?.data;
  const leads: LeadListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: LeadListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("Lead deactivated");
        } else {
          await reactivateMut.mutateAsync(id);
          toast.success("Lead reactivated");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [deactivateMut, reactivateMut],
  );

  const tableData = useMemo(() => {
    const flat = flattenLeads(leads);
    return flat.map((row, idx) => ({
      ...row,
      active: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={leads[idx].isActive ?? true}
            onChange={() => handleToggleActive(row.id as string, leads[idx].isActive ?? true)}
          />
        </div>
      ),
    }));
  }, [leads, handleToggleActive]);

  const selectedArray = Array.from(selectedIds);

  // ── Bulk delete hook ────────────────────────────────────
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "lead",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  // ── Single row delete (soft delete) ─────────────────────
  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Lead",
        message: `Move lead "${row.leadNumber}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("Lead moved to recycle bin");
      } catch {
        toast.error("Failed to delete lead");
      }
    },
    [confirm, softDeleteMutation],
  );

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/leads/${row.id}/edit`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/leads/new");
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
        onClick: () => router.push("/leads/mass-update"),
      },
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/leads/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Leads" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Leads"
          tableKey="leads"
          columns={LEAD_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={LEAD_FILTER_CONFIG}
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
        entityName="lead"
      />

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="lead"
      />

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
