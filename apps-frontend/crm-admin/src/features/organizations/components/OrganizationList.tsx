"use client";

import { useMemo, useCallback, useState, lazy, Suspense } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { useEntityPanel } from "@/hooks/useEntityPanel";
const VerifyFlowModal = lazy(() => import("@/features/entity-verification").then(m => ({ default: m.VerifyFlowModal })));
import type { VerifyFlowEntityData } from "@/features/entity-verification";
import { useInitiateVerification } from "@/features/entity-verification/hooks/useEntityVerification";

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
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { HelpButton } from "@/components/common/HelpButton";

const BulkEditPanel = lazy(() => import("@/components/common/BulkEditPanel").then(m => ({ default: m.BulkEditPanel })));
const DataImport = lazy(() => import("@/components/common/DataImport").then(m => ({ default: m.DataImport })));

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

import { useSidePanelStore } from "@/stores/side-panel.store";
import { LedgerForm } from "@/features/accounts/components/LedgerForm";
import type { SourceEntity } from "@/features/accounts/components/LedgerSourcePicker";

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
  { id: "verify", label: "ID Verify", visible: true },
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
    displayField: "_rawName",
  });

  const [importOpen, setImportOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<OrganizationListItem | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [bulkVerifyOpen, setBulkVerifyOpen] = useState(false);
  const [bulkVerifyMethod, setBulkVerifyMethod] = useState<"email" | "mobile" | "link">("email");
  const [bulkVerifyProgress, setBulkVerifyProgress] = useState<{ done: number; total: number } | null>(null);

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const softDeleteMutation = useSoftDeleteOrganization();
  const updateMutation = useUpdateOrganization();
  const deactivateMut = useDeactivateOrganization();
  const reactivateMut = useReactivateOrganization();
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

  const dynamicFilterConfig = useDynamicFilterConfig(ORGANIZATION_FILTER_CONFIG, ORGANIZATION_LOOKUP_MAPPINGS);

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(dynamicFilterConfig);

  const params = useMemo<OrganizationListParams>(
    () => ({
      page: 1,
      limit: 50,
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

  // NOTE: Cross-entity action (convert to ledger) — useContentPanel pattern, not CRUD
  // ── Convert to Ledger (opens LedgerForm in drawer) ───────

  const openPanel = useSidePanelStore((s) => s.openPanel);

  const handleConvertToLedger = useCallback(
    (row: Record<string, unknown>) => {
      const orgIdx = row._orgIdx as number;
      const org = organizations[orgIdx];
      if (!org) return;

      const evs = (org as any).entityVerificationStatus ?? "UNVERIFIED";
      if (evs !== "VERIFIED") {
        toast.error("Organization must be verified before converting to ledger");
        return;
      }

      // Build source entity for pre-fill
      const sourceEntity: SourceEntity = {
        type: "organization",
        id: org.id,
        name: org.name,
        mobile: org.phone ?? "",
        email: org.email ?? "",
        gstin: org.gstNumber ?? "",
        address: org.address ?? "",
        city: org.city ?? "",
        state: org.state ?? "",
        pincode: org.pincode ?? "",
        country: org.country ?? "India",
        panNo: "",
        phoneOffice: "",
        contactPerson: "",
        _raw: org,
      };

      const panelId = `ledger-convert-${org.id}`;
      openPanel({
        id: panelId,
        title: `New Ledger — ${org.name}`,
        width: 720,
        content: (
          <LedgerForm
            mode="panel"
            panelId={panelId}
            initialSourceEntity={sourceEntity}
            onSuccess={() => {
              toast.success(`Ledger created for "${org.name}"`);
              useSidePanelStore.getState().closePanel(panelId);
            }}
            onCancel={() => useSidePanelStore.getState().closePanel(panelId)}
          />
        ),
      });
    },
    [organizations, openPanel],
  );

  const tableData = useMemo(() => {
    const flat = flattenOrganizations(organizations);
    return flat.map((row, idx) => ({
      ...row,
      _rawName: organizations[idx].name,
      name: (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            handleRowView({ ...row, name: organizations[idx].name });
          }}
        >
          {organizations[idx].name}
        </span>
      ),
      verify: (() => {
        const evs = (organizations[idx] as any).entityVerificationStatus ?? "UNVERIFIED";
        const isVerified = evs === "VERIFIED";
        return (
          <div onClick={(e) => e.stopPropagation()} title={isVerified ? "Verified" : "Not verified — click to verify"}>
            <button
              onClick={() => { setVerifyTarget(organizations[idx]); setVerifyOpen(true); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
            >
              <span style={{ color: isVerified ? "#16a34a" : "#d1d5db", display: "flex" }}><Icon name="shield-check" size={16} /></span>
            </button>
          </div>
        );
      })(),
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
      _verifyStatus: (organizations[idx] as any).entityVerificationStatus ?? "UNVERIFIED",
      _orgIdx: idx,
    }));
  }, [organizations, handleToggleActive, togglingId, handleRowView]);

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

  // ── Bulk verify handler ────────────────────────────────────

  const handleBulkVerifySend = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setBulkVerifyProgress({ done: 0, total: ids.length });
    for (let i = 0; i < ids.length; i++) {
      try {
        await initiateMut.mutateAsync({
          entityType: "ORGANIZATION",
          entityId: ids[i],
          mode: bulkVerifyMethod === "link" ? "LINK" : "OTP",
          channel: bulkVerifyMethod === "mobile" ? "MOBILE_SMS" : "EMAIL",
        });
      } catch {
        // continue with next
      }
      setBulkVerifyProgress({ done: i + 1, total: ids.length });
    }
    setBulkVerifyOpen(false);
    setBulkVerifyProgress(null);
    toast.success(`Verification sent to ${ids.length} organizations`);
  }, [selectedIds, initiateMut, bulkVerifyMethod]);

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
          data={tableData as Record<string, unknown>[]}
          title="Organizations"
          tableKey="organizations"
          columns={ORGANIZATION_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={dynamicFilterConfig}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onCreate={handleCreate}
          customMenuActions={[
            {
              id: "dashboard",
              label: "Dashboard",
              icon: <Icon name="layout-dashboard" size={14} />,
              onClick: (row: Record<string, unknown>) => handleRowView(row),
            },
            {
              id: "edit",
              label: "Edit",
              icon: <Icon name="edit" size={14} />,
              onClick: (row: Record<string, unknown>) => handleRowView(row),
            },
            {
              id: "view-log",
              label: "View Log",
              icon: <Icon name="history" size={14} />,
              onClick: (row: Record<string, unknown>) => router.push(`/organizations/${row.id}`),
            },
            {
              id: "convert-to-ledger",
              label: "Convert to Ledger",
              icon: <Icon name="book-open" size={14} />,
              dividerBefore: true,
              onClick: (row: Record<string, unknown>) => handleConvertToLedger(row),
            },
            {
              id: "delete",
              label: "Delete",
              icon: <Icon name="trash-2" size={14} />,
              danger: true,
              dividerBefore: true,
              onClick: (row: Record<string, unknown>) => handleRowArchive(row),
            },
          ]}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          headerActions={
            <>
              <button onClick={() => setImportOpen(true)} className="flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" title="Import"><Icon name="upload" size={14} /></button>
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
      {bulkEditOpen && (
        <Suspense fallback={null}>
          <BulkEditPanel
            isOpen={bulkEditOpen}
            onClose={() => setBulkEditOpen(false)}
            ids={selectedArray}
            fields={BULK_EDIT_FIELDS}
            onSubmit={handleBulkEditSubmit}
            entityName="organization"
          />
        </Suspense>
      )}

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
              Send verification to {selectionCount} organization{selectionCount !== 1 ? "s" : ""}?
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              {organizations
                .filter((o) => selectedIds.has(o.id))
                .slice(0, 5)
                .map((o) => o.name)
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
                    name="bulkVerifyMethodOrg"
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
        <Suspense fallback={null}>
          <VerifyFlowModal
            entityType="ORGANIZATION"
            entityId={verifyTarget.id}
            entityName={verifyTarget.name}
            entityData={{
              name: verifyTarget.name,
              email: verifyTarget.email,
              phone: verifyTarget.phone,
            } satisfies VerifyFlowEntityData}
            currentStatus={(verifyTarget as any).entityVerificationStatus ?? "UNVERIFIED"}
            onClose={() => { setVerifyOpen(false); setVerifyTarget(null); }}
            onVerified={() => { setVerifyOpen(false); setVerifyTarget(null); }}
            onSaveBeforeVerify={async (data) => {
              await updateMutation.mutateAsync({ id: verifyTarget.id, data });
            }}
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
            entityType="ORGANIZATION"
            entityLabel="Organizations"
            onComplete={() => setImportOpen(false)}
            onClose={() => setImportOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
