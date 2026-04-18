"use client";

import { useMemo, useState } from "react";

import { Badge, Icon } from "@/components/ui";

import { useAuditDetail, useAuditDiff } from "../hooks/useAuditLogs";

import type { AuditLogItem, AuditFieldChange } from "../types/audit.types";

// ── Action badge color map ──────────────────────────────

const ACTION_BADGE: Record<string, "success" | "primary" | "danger" | "warning" | "secondary"> = {
  CREATE: "success",
  UPDATE: "primary",
  DELETE: "danger",
  RESTORE: "warning",
  PERMANENT_DELETE: "danger",
  LOGIN: "secondary",
  LOGOUT: "secondary",
  EXPORT: "primary",
  IMPORT: "primary",
};

// ── Helpers ─────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function humanize(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Props ───────────────────────────────────────────────

interface AuditLogDetailProps {
  auditId: string;
}

// ── Component ───────────────────────────────────────────

export function AuditLogDetail({ auditId }: AuditLogDetailProps) {
  const [showRequestInfo, setShowRequestInfo] = useState(false);

  const { data: detailData, isLoading: detailLoading } = useAuditDetail(auditId);
  const { data: diffData } = useAuditDiff(auditId);

  // Defensive unwrapping
  const detail: AuditLogItem | null = useMemo(() => {
    const raw = detailData?.data;
    if (!raw) return null;
    if ((raw as any).id) return raw as unknown as AuditLogItem;
    const nested = raw as unknown as { data?: AuditLogItem };
    return nested?.data ?? null;
  }, [detailData]);

  const changes: AuditFieldChange[] = useMemo(() => {
    // Prefer diff endpoint changes
    const diffRaw = diffData?.data;
    if (diffRaw) {
      const diff = (diffRaw as any).changes ?? (diffRaw as any)?.data?.changes;
      if (Array.isArray(diff) && diff.length > 0) return diff;
    }
    // Fallback to detail fieldChanges
    return detail?.fieldChanges ?? [];
  }, [diffData, detail]);

  if (detailLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Icon name="alert-circle" size={32} className="mx-auto mb-2 text-gray-400" />
        <p>Audit log not found.</p>
      </div>
    );
  }

  const badgeVariant = ACTION_BADGE[detail.action] ?? "secondary";

  return (
    <div className="p-5 space-y-6 text-sm">
      {/* ── Header ──────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={badgeVariant}>{detail.action.replace(/_/g, " ")}</Badge>
          <Badge variant="outline" className="capitalize">
            {detail.entityType.replace(/_/g, " ")}
          </Badge>
          {detail.isSensitive && <Badge variant="danger">Sensitive</Badge>}
        </div>
        <p className="text-gray-700">{detail.summary}</p>
        <p className="text-xs text-gray-400">{formatTimestamp(detail.createdAt)}</p>
      </div>

      {/* ── Performed By ────────────────────────── */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Performed By
        </h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="user" size={14} className="text-gray-400" />
            <span className="font-medium">{detail.performedByName ?? "System"}</span>
          </div>
          {detail.performedByEmail && (
            <div className="flex items-center gap-2">
              <Icon name="mail" size={14} className="text-gray-400" />
              <span className="text-gray-600">{detail.performedByEmail}</span>
            </div>
          )}
          {detail.performedByRole && (
            <div className="flex items-center gap-2">
              <Icon name="shield" size={14} className="text-gray-400" />
              <span className="text-gray-600">{detail.performedByRole}</span>
            </div>
          )}
          {detail.ipAddress && (
            <div className="flex items-center gap-2">
              <Icon name="globe" size={14} className="text-gray-400" />
              <span className="text-gray-600">{detail.ipAddress}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Field Changes ───────────────────────── */}
      {changes.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Field Changes ({changes.length})
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Field</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Old Value</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">New Value</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, idx) => (
                  <tr
                    key={change.id ?? idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {humanize(change.fieldName)}
                    </td>
                    <td className="px-3 py-2">
                      {change.oldDisplayValue || change.oldValue ? (
                        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {change.oldDisplayValue ?? change.oldValue}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">empty</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {change.newDisplayValue || change.newValue ? (
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          {change.newDisplayValue ?? change.newValue}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">empty</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tags & Metadata ─────────────────────── */}
      {(detail.correlationId || detail.source || detail.module || (detail.tags && detail.tags.length > 0)) && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Metadata
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
            {detail.source && (
              <div>
                <span className="text-gray-500">Source:</span>{" "}
                <span className="text-gray-700">{detail.source}</span>
              </div>
            )}
            {detail.module && (
              <div>
                <span className="text-gray-500">Module:</span>{" "}
                <span className="text-gray-700">{detail.module}</span>
              </div>
            )}
            {detail.correlationId && (
              <div>
                <span className="text-gray-500">Correlation ID:</span>{" "}
                <span className="text-gray-700 font-mono">{detail.correlationId}</span>
              </div>
            )}
            {detail.tags && detail.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-gray-500">Tags:</span>
                {detail.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Request Info (collapsible) ──────────── */}
      {(detail.httpMethod || detail.requestUrl || detail.userAgent) && (
        <section>
          <button
            onClick={() => setShowRequestInfo(!showRequestInfo)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
          >
            <Icon
              name={showRequestInfo ? "chevron-down" : "chevron-right"}
              size={14}
            />
            Request Info
          </button>
          {showRequestInfo && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-1 text-xs font-mono">
              {detail.httpMethod && detail.requestUrl && (
                <div>
                  <span className="text-blue-600 font-semibold">{detail.httpMethod}</span>{" "}
                  <span className="text-gray-700">{detail.requestUrl}</span>
                </div>
              )}
              {detail.userAgent && (
                <div className="text-gray-500 break-all">{detail.userAgent}</div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
