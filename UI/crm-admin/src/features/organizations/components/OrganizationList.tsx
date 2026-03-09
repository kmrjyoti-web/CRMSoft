"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { OrganizationForm } from "./OrganizationForm";
import { OrganizationDashboard } from "./OrganizationDashboard";

import { TableFull, Button, Icon, Switch } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useDynamicFilterConfig } from "@/hooks/useDynamicFilterConfig";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useBulkOperations } from "@/hooks/useBulkOperations";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { BulkActionsBar } from "@/components/common/BulkActionsBar";
import { BulkEditPanel } from "@/components/common/BulkEditPanel";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { HelpButton } from "@/components/common/HelpButton";

import {
  useOrganizationsList,
  useSoftDeleteOrganization,
  useUpdateOrganization,
  useDeactivateOrganization,
  useReactivateOrganization,
} from "../hooks/useOrganizations";

import { ORGANIZATION_FILTER_CONFIG, ORGANIZATION_LOOKUP_MAPPINGS } from "../utils/organization-filters";
import { OrganizationListUserHelp } from "../help/OrganizationListUserHelp";
import { OrganizationListDevHelp } from "../help/OrganizationListDevHelp";

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

  const { handleRowEdit, handleCreate, handleRowView } = useEntityPanel({
    entityKey: "org",
    entityLabel: "Organization",
    FormComponent: OrganizationForm,
    DashboardComponent: OrganizationDashboard,
    dashboardWidth: 900,
    idProp: "organizationId",
    editRoute: "/organizations/:id/edit",
    createRoute: "/organizations/new",
    displayField: "name",
  });

  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const dynamicFilterConfig = useDynamicFilterConfig(ORGANIZATION_FILTER_CONFIG, ORGANIZATION_LOOKUP_MAPPINGS);

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(dynamicFilterConfig);

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
      if (togglingId) return;
      setTogglingId(id);
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
      } finally {
        setTogglingId(null);
      }
    },
    [deactivateMut, reactivateMut, togglingId],
  );

  const tableData = useMemo(() => {
    const flat = flattenOrganizations(organizations);
    return flat.map((row, idx) => ({
      ...row,
      name: (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            handleRowView(row);
          }}
        >
          {organizations[idx].name}
        </span>
      ),
      status: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={organizations[idx].isActive}
            onChange={() => handleToggleActive(row.id as string, organizations[idx].isActive)}
            disabled={togglingId === row.id}
          />
        </div>
      ),
    }));
  }, [organizations, handleToggleActive, togglingId, handleRowView]);

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
          filterConfig={dynamicFilterConfig}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onRowEdit={handleRowView}
          onCreate={handleCreate}
          onRowDelete={handleRowArchive}
          onRowArchive={handleRowArchive}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          headerActions={
            <>
              <HelpButton
                panelId="organizations-list-help"
                title="Organizations — Help"
                userContent={<OrganizationListUserHelp />}
                devContent={<OrganizationListDevHelp />}
              />
              <ActionsMenu items={actionsMenuItems} />
            </>
          }
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
