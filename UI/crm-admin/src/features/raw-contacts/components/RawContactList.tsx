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

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { useRawContactsList, useUpdateRawContact, useSoftDeleteRawContact, useDeactivateRawContact, useReactivateRawContact } from "../hooks/useRawContacts";

import { RawContactForm } from "./RawContactForm";

import { RAW_CONTACT_FILTER_CONFIG } from "../utils/raw-contact-filters";

import type {
  RawContactListItem,
  RawContactListParams,
} from "../types/raw-contacts.types";

// ── Column definitions ──────────────────────────────────

const RAW_CONTACT_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "companyName", label: "Company", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "source", label: "Source", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "active", label: "Active", visible: true },
  { id: "designation", label: "Designation", visible: false },
  { id: "department", label: "Department", visible: false },
  { id: "createdAt", label: "Created", visible: true },
];

// ── Bulk edit fields ────────────────────────────────────

const BULK_EDIT_FIELDS = [
  { key: "designation", label: "Designation", type: "text" as const },
  { key: "department", label: "Department", type: "text" as const },
  { key: "companyName", label: "Company Name", type: "text" as const },
];

// ── Helpers ─────────────────────────────────────────────

function getPrimaryComm(contact: RawContactListItem, type: "EMAIL" | "PHONE" | "MOBILE") {
  return (
    contact.communications?.find((c) => c.type === type && c.isPrimary)?.value ??
    contact.communications?.find((c) => c.type === type)?.value ??
    "—"
  );
}

function flattenContacts(contacts: RawContactListItem[]): Record<string, unknown>[] {
  return contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    companyName: c.companyName ?? "—",
    email: getPrimaryComm(c, "EMAIL"),
    phone: getPrimaryComm(c, "MOBILE"),
    source: c.source?.replace(/_/g, " ") ?? "—",
    status: c.status,
    designation: c.designation ?? "—",
    department: c.department ?? "—",
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
    _maskingMeta: (c as any)._maskingMeta,
  }));
}

// ── Component ───────────────────────────────────────────

export function RawContactList() {
  const router = useRouter();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "raw-contact",
    entityLabel: "Contact",
    FormComponent: RawContactForm,
    idProp: "rawContactId",
    editRoute: "/raw-contacts/:id/edit",
    createRoute: "/raw-contacts/new",
    displayField: "name",
    headerButtons: [
      { id: "btn-phone", label: "Call", icon: "phone", showAs: "icon" as const, onClick: () => {}, variant: "ghost" as const },
      { id: "btn-mail", label: "Email", icon: "mail", showAs: "icon" as const, onClick: () => {}, variant: "ghost" as const },
    ],
  });

  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteRawContact();
  const updateMutation = useUpdateRawContact();
  const deactivateMut = useDeactivateRawContact();
  const reactivateMut = useReactivateRawContact();
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
    useTableFilters(RAW_CONTACT_FILTER_CONFIG);

  const params = useMemo<RawContactListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading, error } = useRawContactsList(params);

  const responseData = data?.data;
  const contacts: RawContactListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: RawContactListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      if (togglingId) return;
      setTogglingId(id);
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("Raw contact deactivated");
        } else {
          await reactivateMut.mutateAsync(id);
          toast.success("Raw contact reactivated");
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
    const flat = flattenContacts(contacts);
    return flat.map((row, idx) => ({
      ...row,
      active: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={contacts[idx].isActive ?? true}
            onChange={() => handleToggleActive(row.id as string, contacts[idx].isActive ?? true)}
            disabled={togglingId === row.id}
          />
        </div>
      ),
    }));
  }, [contacts, handleToggleActive, togglingId]);

  const selectedArray = Array.from(selectedIds);

  // ── Bulk delete hook ────────────────────────────────────
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "raw contact",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  // ── Single row delete (soft delete) ─────────────────────
  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Raw Contact",
        message: `Move "${row.name}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("Raw contact moved to recycle bin");
      } catch {
        toast.error("Failed to delete raw contact");
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
        onClick: () => router.push("/raw-contacts/mass-update"),
      },
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/raw-contacts/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Raw Contacts" />;

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load raw contacts</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Raw Contacts"
          tableKey="raw-contacts"
          columns={RAW_CONTACT_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={RAW_CONTACT_FILTER_CONFIG}
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
        entityName="raw contact"
      />

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="raw contact"
      />

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
