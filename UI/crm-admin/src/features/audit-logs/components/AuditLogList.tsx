"use client";

import { useMemo, useState, useCallback } from "react";

import { TableFull, Icon, Input, SelectInput } from "@/components/ui";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useContentPanel } from "@/hooks/useEntityPanel";

import { useAuditFeed } from "../hooks/useAuditLogs";
import { AuditLogDetail } from "./AuditLogDetail";

import type { AuditLogItem, AuditQueryParams } from "../types/audit.types";

// ── Column definitions ──────────────────────────────────

const AUDIT_COLUMNS = [
  { id: "createdAt", label: "Timestamp", visible: true },
  { id: "performedByName", label: "User", visible: true },
  { id: "action", label: "Action", visible: true },
  { id: "entityType", label: "Entity Type", visible: true },
  { id: "summary", label: "Summary", visible: true },
  { id: "changesCount", label: "Changes", visible: true },
  { id: "ipAddress", label: "IP Address", visible: false },
  { id: "source", label: "Source", visible: false },
];

// ── Filter options ──────────────────────────────────────

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "contact", label: "Contact" },
  { value: "organization", label: "Organization" },
  { value: "lead", label: "Lead" },
  { value: "activity", label: "Activity" },
  { value: "user", label: "User" },
  { value: "role", label: "Role" },
  { value: "raw_contact", label: "Raw Contact" },
  { value: "quotation", label: "Quotation" },
  { value: "invoice", label: "Invoice" },
  { value: "payment", label: "Payment" },
  { value: "installation", label: "Installation" },
  { value: "training", label: "Training" },
  { value: "ticket", label: "Ticket" },
  { value: "workflow", label: "Workflow" },
  { value: "template", label: "Template" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "RESTORE", label: "Restore" },
  { value: "PERMANENT_DELETE", label: "Permanent Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "EXPORT", label: "Export" },
  { value: "IMPORT", label: "Import" },
];

// ── Helpers ─────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ");
}

function flattenLogs(items: AuditLogItem[]): Record<string, unknown>[] {
  return items.map((item) => ({
    id: item.id,
    createdAt: formatTimestamp(item.createdAt),
    performedByName: item.performedByName ?? "System",
    action: formatAction(item.action),
    entityType: item.entityType.replace(/_/g, " "),
    summary: item.summary ?? "—",
    changesCount: item.fieldChanges?.length
      ? `${item.fieldChanges.length} field${item.fieldChanges.length !== 1 ? "s" : ""}`
      : "—",
    ipAddress: item.ipAddress ?? "—",
    source: item.source ?? "—",
    _raw: item,
  }));
}

// ── Component ───────────────────────────────────────────

export function AuditLogList() {
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { openContent } = useContentPanel();

  const params = useMemo<AuditQueryParams>(
    () => ({
      limit: 100,
      ...(entityTypeFilter ? { entityType: entityTypeFilter } : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [entityTypeFilter, actionFilter, dateFrom, dateTo],
  );

  const { data, isLoading } = useAuditFeed(params);

  const responseData = data?.data;
  const items: AuditLogItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: AuditLogItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenLogs(items), [items]);

  // ── Row click → open detail panel ─────────────────────

  const handleRowClick = useCallback(
    (row: Record<string, unknown>) => {
      const auditId = row.id as string;
      openContent({
        id: `audit-detail-${auditId}`,
        title: "Audit Log Detail",
        content: <AuditLogDetail auditId={auditId} />,
        icon: "file-clock",
        width: 720,
      });
    },
    [openContent],
  );

  if (isLoading) return <TableSkeleton title="Audit Logs" />;

  return (
    <div className="h-full flex flex-col">
      {/* Filters bar */}
      <div className="px-4 pt-3 pb-2 flex gap-3 flex-wrap items-end">
        <div className="w-48">
          <SelectInput
            label="Entity Type"
            value={entityTypeFilter}
            onChange={(v) => setEntityTypeFilter(String(v ?? ""))}
            options={ENTITY_TYPE_OPTIONS}
            leftIcon={<Icon name="layers" size={16} />}
          />
        </div>
        <div className="w-44">
          <SelectInput
            label="Action"
            value={actionFilter}
            onChange={(v) => setActionFilter(String(v ?? ""))}
            options={ACTION_OPTIONS}
            leftIcon={<Icon name="zap" size={16} />}
          />
        </div>
        <div className="w-40">
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(v) => setDateFrom(v)}
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
        <div className="w-40">
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(v) => setDateTo(v)}
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
        {(entityTypeFilter || actionFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setEntityTypeFilter("");
              setActionFilter("");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Audit Logs"
          columns={AUDIT_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={handleRowClick}
        />
      </div>
    </div>
  );
}
