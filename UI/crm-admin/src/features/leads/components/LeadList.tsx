"use client";

import { useMemo, useCallback, useState, lazy, Suspense } from "react";

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { TableFull, Switch, Icon } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useBulkOperations } from "@/hooks/useBulkOperations";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { BulkActionsBar } from "@/components/common/BulkActionsBar";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { HelpButton } from "@/components/common/HelpButton";

const BulkEditPanel = lazy(() => import("@/components/common/BulkEditPanel").then(m => ({ default: m.BulkEditPanel })));
const DataImport = lazy(() => import("@/components/common/DataImport").then(m => ({ default: m.DataImport })));

import { useOpenDashboard } from "@/hooks/useOpenDashboard";

import { ContactDashboard } from "@/features/contacts/components/ContactDashboard";
import { OrganizationDashboard } from "@/features/organizations/components/OrganizationDashboard";

import { LeadForm } from "./LeadForm";
import { LeadDashboard } from "./LeadDashboard";

import { useLeadsList, useUpdateLead, useSoftDeleteLead, useDeactivateLead, useReactivateLead } from "../hooks/useLeads";

import { LEAD_FILTER_CONFIG } from "../utils/lead-filters";
import { LeadListUserHelp } from "../help/LeadListUserHelp";
import { LeadListDevHelp } from "../help/LeadListDevHelp";

import type {
  LeadListItem,
  LeadListParams,
  LeadStatus,
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

  const { handleRowEdit, handleCreate, handleRowView } = useEntityPanel({
    entityKey: "lead",
    entityLabel: "Lead",
    FormComponent: LeadForm,
    DashboardComponent: LeadDashboard,
    dashboardWidth: 900,
    idProp: "leadId",
    editRoute: "/leads/:id/edit",
    createRoute: "/leads/new",
    displayField: "leadNumber",
  });

  const openDashboard = useOpenDashboard();

  const [importOpen, setImportOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
      limit: 50,
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
      if (togglingId) return;
      setTogglingId(id);
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
      } finally {
        setTogglingId(null);
      }
    },
    [deactivateMut, reactivateMut, togglingId],
  );

  const tableData = useMemo(() => {
    const flat = flattenLeads(leads);
    return flat.map((row, idx) => ({
      ...row,
      leadNumber: (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            handleRowView(row);
          }}
        >
          {leads[idx].leadNumber}
        </span>
      ),
      contactName: (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            openDashboard({
              entityKey: "contact",
              entityLabel: "Contact",
              entityId: leads[idx].contact.id,
              displayName: `${leads[idx].contact.firstName} ${leads[idx].contact.lastName}`,
              DashboardComponent: ContactDashboard,
            });
          }}
        >
          {`${leads[idx].contact.firstName} ${leads[idx].contact.lastName}`}
        </span>
      ),
      organization: leads[idx].organization ? (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            openDashboard({
              entityKey: "org",
              entityLabel: "Organization",
              entityId: leads[idx].organization!.id,
              displayName: leads[idx].organization!.name,
              DashboardComponent: OrganizationDashboard,
            });
          }}
        >
          {leads[idx].organization!.name}
        </span>
      ) : "—",
      active: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={leads[idx].isActive ?? true}
            onChange={() => handleToggleActive(row.id as string, leads[idx].isActive ?? true)}
            disabled={togglingId === row.id}
          />
        </div>
      ),
    }));
  }, [leads, handleToggleActive, togglingId, handleRowView, openDashboard]);

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

  // ── All lead statuses for Kanban columns ───────────────────

  const ALL_LEAD_STATUSES: LeadStatus[] = [
    "NEW", "VERIFIED", "ALLOCATED", "IN_PROGRESS",
    "DEMO_SCHEDULED", "QUOTATION_SENT", "NEGOTIATION",
    "WON", "LOST", "ON_HOLD",
  ];

  const kanbanCategoryOptions = useMemo(
    () => ({ status: ALL_LEAD_STATUSES as string[] }),
    [],
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
          onRowEdit={handleRowView}
          onRowDelete={handleRowDelete}
          onCreate={handleCreate}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          kanbanCategoryOptions={kanbanCategoryOptions}
          headerActions={
            <>
              <button onClick={() => setImportOpen(true)} className="flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" title="Import"><Icon name="upload" size={14} /></button>
              <HelpButton
                panelId="leads-list-help"
                title="Leads — Help"
                userContent={<LeadListUserHelp />}
                devContent={<LeadListDevHelp />}
              />
              <ActionsMenu items={actionsMenuItems} />
            </>
          }
        />
      </div>

      <BulkActionsBar
        count={selectionCount}
        onEdit={() => setBulkEditOpen(true)}
        onDelete={() => triggerBulkDelete()}
        onClear={clearSelection}
        entityName="lead"
      />

      {/* Bulk Edit Panel */}
      {bulkEditOpen && (
        <Suspense fallback={null}>
          <BulkEditPanel
            isOpen={bulkEditOpen}
            onClose={() => setBulkEditOpen(false)}
            ids={selectedArray}
            fields={BULK_EDIT_FIELDS}
            onSubmit={handleBulkEditSubmit}
            entityName="lead"
          />
        </Suspense>
      )}

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />

      {/* Data Import Modal */}
      {importOpen && (
        <Suspense fallback={null}>
          <DataImport
            entityType="LEAD"
            entityLabel="Leads"
            onComplete={() => setImportOpen(false)}
            onClose={() => setImportOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
