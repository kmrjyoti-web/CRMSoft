"use client";

import { useMemo, useCallback, useState } from "react";

import toast from "react-hot-toast";

import { TableFull, Button, Icon, Badge } from "@/components/ui";

import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useBulkOperations } from "@/hooks/useBulkOperations";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { useBulkDeleteDialog } from "@/components/common/BulkDeleteDialog";

import { contactsService } from "@/features/contacts/services/contacts.service";
import { organizationsService } from "@/features/organizations/services/organizations.service";
import { leadsService } from "@/features/leads/services/leads.service";
import { activitiesService } from "@/features/activities/services/activities.service";
import { rawContactsService } from "@/features/raw-contacts/services/raw-contacts.service";
import { usersService } from "@/features/settings/services/users.service";

import { useRecycleBinList } from "../hooks/useRecycleBin";

import type { RecycleBinItem, RecycleBinEntityType } from "../types/recycle-bin.types";

// ── Column definitions ──────────────────────────────────

const RECYCLE_BIN_COLUMNS = [
  { id: "entityType", label: "Type", visible: true },
  { id: "name", label: "Name", visible: true },
  { id: "subtitle", label: "Details", visible: true },
  { id: "deletedAt", label: "Deleted At", visible: true },
  { id: "deletedBy", label: "Deleted By", visible: true },
];

// ── Entity type tabs ────────────────────────────────────

const ENTITY_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Contacts", value: "contact" },
  { label: "Organizations", value: "organization" },
  { label: "Leads", value: "lead" },
  { label: "Activities", value: "activity" },
  { label: "Raw Contacts", value: "raw_contact" },
  { label: "Users", value: "user" },
];

// ── Service map for restore/permanent-delete ────────────

const SERVICE_MAP: Record<
  RecycleBinEntityType,
  { restore: (id: string) => Promise<unknown>; permanentDelete: (id: string) => Promise<unknown> }
> = {
  contact: { restore: contactsService.restore, permanentDelete: contactsService.permanentDelete },
  organization: { restore: organizationsService.restore, permanentDelete: organizationsService.permanentDelete },
  lead: { restore: leadsService.restore, permanentDelete: leadsService.permanentDelete },
  activity: { restore: activitiesService.restore, permanentDelete: activitiesService.permanentDelete },
  raw_contact: { restore: rawContactsService.restore, permanentDelete: rawContactsService.permanentDelete },
  user: { restore: usersService.restore, permanentDelete: usersService.permanentDelete },
};

// ── Helpers ─────────────────────────────────────────────

function flattenItems(items: RecycleBinItem[]): Record<string, unknown>[] {
  return items.map((item) => ({
    id: `${item.entityType}::${item.id}`,
    rawId: item.id,
    entityType: item.entityType.replace(/_/g, " "),
    name: item.name,
    subtitle: item.subtitle ?? "—",
    deletedAt: item.deletedAt
      ? new Date(item.deletedAt).toLocaleDateString()
      : "—",
    deletedBy: item.deletedBy ?? "—",
    _entityType: item.entityType, // keep raw for service lookup
  }));
}

// ── Component ───────────────────────────────────────────

export function RecycleBinList() {
  const [activeTab, setActiveTab] = useState("");

  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const { execute: bulkExecute } = useBulkOperations();

  const {
    selectedIds,
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

  const params = useMemo(
    () => ({
      ...(activeTab ? { entityType: activeTab } : {}),
      limit: 10000,
    }),
    [activeTab],
  );

  const { data, isLoading } = useRecycleBinList(params);

  const responseData = data?.data;
  const items: RecycleBinItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: RecycleBinItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenItems(items), [items]);

  const selectedArray = Array.from(selectedIds);

  // ── Bulk permanent-delete hook ─────────────────────────

  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName: "record",
    action: async (compositeId) => {
      const [entityType, rawId] = compositeId.split("::");
      const svc = SERVICE_MAP[entityType as RecycleBinEntityType];
      if (svc) await svc.permanentDelete(rawId);
    },
    onComplete: () => clearSelection(),
  });

  // ── Single row restore ─────────────────────────────────

  const handleRowRestore = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Restore Record",
        message: `Restore "${row.name}" back to active records?`,
        type: "warning",
        confirmText: "Restore",
      });
      if (!ok) return;
      try {
        const entityType = row._entityType as RecycleBinEntityType;
        const svc = SERVICE_MAP[entityType];
        if (svc) await svc.restore(row.rawId as string);
        toast.success("Record restored successfully");
      } catch {
        toast.error("Failed to restore record");
      }
    },
    [confirm],
  );

  // ── Single row permanent delete ────────────────────────

  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Permanently Delete",
        message: `Permanently delete "${row.name}"? This action cannot be undone.`,
        type: "danger",
        confirmText: "Delete Forever",
      });
      if (!ok) return;
      try {
        const entityType = row._entityType as RecycleBinEntityType;
        const svc = SERVICE_MAP[entityType];
        if (svc) await svc.permanentDelete(row.rawId as string);
        toast.success("Record permanently deleted");
      } catch {
        toast.error("Failed to delete record");
      }
    },
    [confirm],
  );

  // ── Bulk restore handler ───────────────────────────────

  const handleBulkRestore = useCallback(async () => {
    const ok = await confirm({
      title: "Restore Selected",
      message: `Restore ${selectionCount} record${selectionCount !== 1 ? "s" : ""} back to active?`,
      type: "warning",
      confirmText: "Restore All",
    });
    if (!ok) return;
    await bulkExecute(selectedArray, async (compositeId) => {
      const [entityType, rawId] = compositeId.split("::");
      const svc = SERVICE_MAP[entityType as RecycleBinEntityType];
      if (svc) await svc.restore(rawId);
    });
    clearSelection();
    toast.success("Records restored");
  }, [confirm, selectionCount, selectedArray, bulkExecute, clearSelection]);

  if (isLoading) return <TableSkeleton title="Recycle Bin" />;

  return (
    <div className="h-full flex flex-col">
      {/* Entity type filter tabs */}
      <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
        {ENTITY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              activeTab === tab.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Recycle Bin"
          columns={RECYCLE_BIN_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={handleRowRestore}
          onRowDelete={handleRowDelete}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* Floating bulk actions bar */}
      {selectionCount > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: "#1e293b",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {selectionCount} record{selectionCount !== 1 ? "s" : ""} selected
          </span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleBulkRestore}
            style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
          >
            <Icon name="rotate-ccw" size={14} /> Restore
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => triggerBulkDelete()}
          >
            <Icon name="trash-2" size={14} /> Delete Forever
          </Button>
          <button
            onClick={clearSelection}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
            title="Clear selection"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialogPortal />
      <BulkDeleteDialogPortal />
    </div>
  );
}
