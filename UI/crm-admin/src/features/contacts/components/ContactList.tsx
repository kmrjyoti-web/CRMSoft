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

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useContactsList,
  useSoftDeleteContact,
  useUpdateContact,
  useDeactivateContact,
  useReactivateContact,
} from "../hooks/useContacts";

import { ContactForm } from "./ContactForm";

import { CONTACT_FILTER_CONFIG } from "../utils/contact-filters";

import type {
  ContactListItem,
  ContactListParams,
} from "../types/contacts.types";

// ── Column definitions ──────────────────────────────────

const CONTACT_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "designation", label: "Designation", visible: true },
  { id: "organization", label: "Organization", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

// ── Bulk edit fields ────────────────────────────────────

const BULK_EDIT_FIELDS = [
  { key: "designation", label: "Designation", type: "text" as const },
  { key: "department", label: "Department", type: "text" as const },
];

// ── Helpers ─────────────────────────────────────────────

function getPrimaryComm(contact: ContactListItem, type: "EMAIL" | "PHONE" | "MOBILE") {
  return (
    contact.communications?.find((c) => c.type === type && c.isPrimary)?.value ??
    contact.communications?.find((c) => c.type === type)?.value ??
    "—"
  );
}

function flattenContacts(contacts: ContactListItem[]): Record<string, unknown>[] {
  return contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: getPrimaryComm(c, "EMAIL"),
    phone: getPrimaryComm(c, "MOBILE"),
    designation: c.designation ?? "—",
    organization: c.contactOrganizations?.[0]?.organization?.name ?? "—",
    status: c.isActive ? "Active" : "Inactive",
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
    _maskingMeta: (c as any)._maskingMeta,
  }));
}

// ── Component ───────────────────────────────────────────

export function ContactList() {
  const router = useRouter();
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteContact();
  const updateMutation = useUpdateContact();
  const deactivateMut = useDeactivateContact();
  const reactivateMut = useReactivateContact();
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
    useTableFilters(CONTACT_FILTER_CONFIG);

  const params = useMemo<ContactListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useContactsList(params);

  const responseData = data?.data;
  const contacts: ContactListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: ContactListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const handleToggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      try {
        if (currentlyActive) {
          await deactivateMut.mutateAsync(id);
          toast.success("Contact deactivated");
        } else {
          await reactivateMut.mutateAsync(id);
          toast.success("Contact reactivated");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [deactivateMut, reactivateMut],
  );

  const tableData = useMemo(() => {
    const flat = flattenContacts(contacts);
    return flat.map((row, idx) => ({
      ...row,
      status: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={contacts[idx].isActive}
            onChange={() => handleToggleActive(row.id as string, contacts[idx].isActive)}
          />
        </div>
      ),
    }));
  }, [contacts, handleToggleActive]);

  // ── Bulk delete hook ────────────────────────────────────
  const selectedArray = Array.from(selectedIds);
  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "contact",
    action: (id) => softDeleteMutation.mutateAsync(id),
    onComplete: () => clearSelection(),
  });

  // ── Single row archive (soft delete) ────────────────────

  const handleRowArchive = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Contact",
        message: `Move "${row.name}" to recycle bin?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await softDeleteMutation.mutateAsync(row.id as string);
        toast.success("Contact moved to recycle bin");
      } catch {
        toast.error("Failed to delete contact");
      }
    },
    [confirm, softDeleteMutation],
  );

  // ── Row edit (panel) ─────────────────────────────────────

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      const panelId = `contact-edit-${row.id}`;
      const formId = `sp-form-contact-${row.id}`;
      openPanel({
        id: panelId,
        title: `Contact: ${(row.name as string) || "Contact"}`,
        newTabUrl: `/contacts/${row.id}/edit`,
        headerButtons: [
          { id: "btn-phone", label: "Call", icon: "phone", showAs: "icon", onClick: () => {}, variant: "ghost" },
          { id: "btn-mail", label: "Email", icon: "mail", showAs: "icon", onClick: () => {}, variant: "ghost" },
        ],
        footerButtons: [
          {
            id: "cancel",
            label: "Cancel",
            showAs: "text",
            variant: "secondary",
            onClick: () => closePanel(panelId),
          },
          {
            id: "save",
            label: "Save Changes",
            icon: "check",
            showAs: "both",
            variant: "primary",
            onClick: () => {
              const form = document.getElementById(formId) as HTMLFormElement | null;
              form?.requestSubmit();
            },
          },
        ],
        content: (
          <ContactForm
            contactId={row.id as string}
            mode="panel"
            panelId={panelId}
            onSuccess={() => closePanel(panelId)}
            onCancel={() => closePanel(panelId)}
          />
        ),
      });
    },
    [openPanel, closePanel],
  );

  const handleCreate = useCallback(() => {
    const panelId = "contact-new";
    const formId = "sp-form-contact-new";
    openPanel({
      id: panelId,
      title: "New Contact",
      newTabUrl: "/contacts/new",
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          onClick: () => closePanel(panelId),
        },
        {
          id: "save",
          label: "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
      content: (
        <ContactForm
          mode="panel"
          panelId={panelId}
          onSuccess={() => closePanel(panelId)}
          onCancel={() => closePanel(panelId)}
        />
      ),
    });
  }, [openPanel, closePanel]);

  // ── Bulk edit handlers ─────────────────────────────────────

  const handleBulkEditSubmit = useCallback(
    async (ids: string[], values: Record<string, unknown>) => {
      await bulkExecute(ids, (id) =>
        updateMutation.mutateAsync({
          id,
          data: values as any,
        }),
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
        onClick: () => router.push("/contacts/mass-update"),
      },
      {
        label: "Mass Delete",
        icon: "trash-2",
        onClick: () => router.push("/contacts/mass-delete"),
        variant: "danger" as const,
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Contacts" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Contacts"
          tableKey="contacts"
          columns={CONTACT_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={CONTACT_FILTER_CONFIG}
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
        entityName="contact"
      />

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="contact"
      />

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
