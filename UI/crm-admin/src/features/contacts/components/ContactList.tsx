"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

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

import { useEntityPanel } from "@/hooks/useEntityPanel";
import { VerifyFlowModal } from "@/features/entity-verification";
import type { VerifyFlowEntityData } from "@/features/entity-verification";
import { useInitiateVerification } from "@/features/entity-verification/hooks/useEntityVerification";

import {
  useContactsList,
  useSoftDeleteContact,
  useUpdateContact,
  useDeactivateContact,
  useReactivateContact,
} from "../hooks/useContacts";

import { useOpenDashboard } from "@/hooks/useOpenDashboard";

import { OrganizationDashboard } from "@/features/organizations/components/OrganizationDashboard";

import { ContactForm } from "./ContactForm";
import { ContactDashboard } from "./ContactDashboard";
import { ContactListUserHelp } from "../help/ContactListUserHelp";
import { ContactListDevHelp } from "../help/ContactListDevHelp";

import { CONTACT_FILTER_CONFIG, CONTACT_LOOKUP_MAPPINGS } from "../utils/contact-filters";

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
  { id: "verify", label: "ID Verify", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: true },
  { id: "rowActions", label: "", visible: true },
];

// ── Bulk edit fields ────────────────────────────────────

const BULK_EDIT_FIELDS = [
  { key: "designation", label: "Designation", type: "text" as const },
  { key: "department", label: "Department", type: "text" as const },
];

// ── Helpers ─────────────────────────────────────────────

function getPrimaryComm(contact: ContactListItem, type: "EMAIL" | "PHONE" | "MOBILE") {
  const primary = contact.communications?.find((c) => c.type === type && c.isPrimary)?.value;
  const any = contact.communications?.find((c) => c.type === type)?.value;
  if (type === "MOBILE") {
    // Fall back to PHONE type if no MOBILE found
    const phonePrimary = contact.communications?.find((c) => c.type === "PHONE" && c.isPrimary)?.value;
    const phoneAny = contact.communications?.find((c) => c.type === "PHONE")?.value;
    return primary ?? any ?? phonePrimary ?? phoneAny ?? "—";
  }
  return primary ?? any ?? "—";
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

  const { handleRowEdit, handleCreate, handleRowView } = useEntityPanel({
    entityKey: "contact",
    entityLabel: "Contact",
    FormComponent: ContactForm,
    DashboardComponent: ContactDashboard,
    dashboardWidth: 900,
    idProp: "contactId",
    editRoute: "/contacts/:id/edit",
    createRoute: "/contacts/new",
    displayField: "name",
    headerButtons: [
      { id: "btn-phone", label: "Call", icon: "phone", showAs: "icon" as const, onClick: () => {}, variant: "ghost" as const },
      { id: "btn-mail", label: "Email", icon: "mail", showAs: "icon" as const, onClick: () => {}, variant: "ghost" as const },
    ],
  });

  const openDashboard = useOpenDashboard();

  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<ContactListItem | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [bulkVerifyOpen, setBulkVerifyOpen] = useState(false);
  const [bulkVerifyMethod, setBulkVerifyMethod] = useState<"email" | "mobile" | "link">("email");
  const [bulkVerifyProgress, setBulkVerifyProgress] = useState<{ done: number; total: number } | null>(null);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteContact();
  const updateMutation = useUpdateContact();
  const deactivateMut = useDeactivateContact();
  const reactivateMut = useReactivateContact();
  const { execute: bulkExecute } = useBulkOperations();
  const initiateMut = useInitiateVerification();

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

  const dynamicFilterConfig = useDynamicFilterConfig(CONTACT_FILTER_CONFIG, CONTACT_LOOKUP_MAPPINGS);

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(dynamicFilterConfig);

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
      if (togglingId) return;
      setTogglingId(id);
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
      } finally {
        setTogglingId(null);
      }
    },
    [deactivateMut, reactivateMut, togglingId],
  );

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

  const tableData = useMemo(() => {
    const flat = flattenContacts(contacts);
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
          {`${contacts[idx].firstName} ${contacts[idx].lastName}`}
        </span>
      ),
      verify: (() => {
        const evs = (contacts[idx] as any).entityVerificationStatus ?? "UNVERIFIED";
        const isVerified = evs === "VERIFIED";
        return (
          <div onClick={(e) => e.stopPropagation()} title={isVerified ? "Verified" : "Not verified — click to verify"}>
            <button
              onClick={() => { setVerifyTarget(contacts[idx]); setVerifyOpen(true); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
            >
              <span style={{ color: isVerified ? "#16a34a" : "#d1d5db", display: "flex" }}><Icon name="shield-check" size={16} /></span>
            </button>
          </div>
        );
      })(),
      organization: contacts[idx].contactOrganizations?.[0]?.organization ? (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            openDashboard({
              entityKey: "org",
              entityLabel: "Organization",
              entityId: contacts[idx].contactOrganizations[0].organization.id,
              displayName: contacts[idx].contactOrganizations[0].organization.name,
              DashboardComponent: OrganizationDashboard,
            });
          }}
        >
          {contacts[idx].contactOrganizations[0].organization.name}
        </span>
      ) : "—",
      status: (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            size="sm"
            checked={contacts[idx].isActive}
            onChange={() => handleToggleActive(row.id as string, contacts[idx].isActive)}
            disabled={togglingId === row.id}
          />
        </div>
      ),
      rowActions: (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionsMenu items={[
            { label: "Edit", icon: "edit", onClick: () => handleRowView(row) },
            {
              label: "Verify Identity",
              icon: "shield-check",
              onClick: () => {
                setVerifyTarget(contacts[idx]);
                setVerifyOpen(true);
              },
            },
            { label: "Delete", icon: "trash-2", onClick: () => handleRowArchive(row), variant: "danger" as const },
          ]} />
        </div>
      ),
    }));
  }, [contacts, handleToggleActive, togglingId, handleRowView, openDashboard, handleRowArchive]);

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

  // ── Bulk verify handler ────────────────────────────────────

  const handleBulkVerifySend = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setBulkVerifyProgress({ done: 0, total: ids.length });
    for (let i = 0; i < ids.length; i++) {
      try {
        await initiateMut.mutateAsync({
          entityType: "CONTACT",
          entityId: ids[i],
          mode: bulkVerifyMethod === "link" ? "LINK" : "OTP",
          channel: bulkVerifyMethod === "mobile" ? "MOBILE_SMS" : bulkVerifyMethod === "link" ? "EMAIL" : "EMAIL",
        });
      } catch {
        // continue with next
      }
      setBulkVerifyProgress({ done: i + 1, total: ids.length });
    }
    setBulkVerifyOpen(false);
    setBulkVerifyProgress(null);
    toast.success(`Verification sent to ${ids.length} contacts`);
  }, [selectedIds, initiateMut, bulkVerifyMethod]);

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
                panelId="contacts-list-help"
                title="Contacts — Help"
                userContent={<ContactListUserHelp />}
                devContent={<ContactListDevHelp />}
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
        entityName="contact"
      />

      {/* Send Verification bulk button — shown when rows selected */}
      {selectionCount > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 76,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 900,
          }}
        >
          <button
            onClick={() => setBulkVerifyOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(14,165,233,0.4)",
            }}
          >
            <Icon name="shield-check" size={15} />
            Send Verification ({selectionCount})
          </button>
        </div>
      )}

      {/* Bulk Edit Panel */}
      <BulkEditPanel
        isOpen={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        ids={selectedArray}
        fields={BULK_EDIT_FIELDS}
        onSubmit={handleBulkEditSubmit}
        entityName="contact"
      />

      {/* Bulk Verify Modal */}
      {bulkVerifyOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && setBulkVerifyOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              width: 440,
              maxWidth: "100%",
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Send verification to {selectionCount} contact{selectionCount !== 1 ? "s" : ""}?
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              {contacts
                .filter((c) => selectedIds.has(c.id))
                .slice(0, 5)
                .map((c) => `${c.firstName} ${c.lastName}`)
                .join(", ")}
              {selectionCount > 5 && ` and ${selectionCount - 5} more`}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Verification method
              </div>
              {(["email", "mobile", "link"] as const).map((m) => (
                <label
                  key={m}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    border: `1.5px solid ${bulkVerifyMethod === m ? "#0ea5e9" : "#e5e7eb"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 6,
                    background: bulkVerifyMethod === m ? "#f0f9ff" : "white",
                    fontSize: 13,
                  }}
                >
                  <input
                    type="radio"
                    name="bulkVerifyMethod"
                    value={m}
                    checked={bulkVerifyMethod === m}
                    onChange={() => setBulkVerifyMethod(m)}
                    style={{ accentColor: "#0ea5e9" }}
                  />
                  {m === "email" ? "Email OTP" : m === "mobile" ? "Mobile OTP" : "Send Link"}
                </label>
              ))}
            </div>

            {bulkVerifyProgress && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  Sending... {bulkVerifyProgress.done} / {bulkVerifyProgress.total}
                </div>
                <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%",
                      background: "#0ea5e9",
                      borderRadius: 2,
                      width: `${(bulkVerifyProgress.done / bulkVerifyProgress.total) * 100}%`,
                      transition: "width 0.2s",
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setBulkVerifyOpen(false)}
                style={{
                  padding: "9px 16px",
                  background: "none",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkVerifySend}
                disabled={!!bulkVerifyProgress}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: bulkVerifyProgress ? 0.6 : 1,
                }}
              >
                {bulkVerifyProgress ? "Sending\u2026" : "Send All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-row Verify Flow Modal */}
      {verifyOpen && verifyTarget && (
        <VerifyFlowModal
          entityType="CONTACT"
          entityId={verifyTarget.id}
          entityName={`${verifyTarget.firstName} ${verifyTarget.lastName}`}
          entityData={{
            firstName: verifyTarget.firstName,
            lastName: verifyTarget.lastName,
            email: verifyTarget.communications?.find((c) => c.type === "EMAIL")?.value,
            phone: verifyTarget.communications?.find((c) => c.type === "PHONE" || c.type === "MOBILE")?.value,
          } satisfies VerifyFlowEntityData}
          currentStatus={(verifyTarget as any).entityVerificationStatus ?? "UNVERIFIED"}
          onClose={() => { setVerifyOpen(false); setVerifyTarget(null); }}
          onVerified={() => { setVerifyOpen(false); setVerifyTarget(null); }}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
