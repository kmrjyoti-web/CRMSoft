"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api-client";

type LogEntry = {
  id: string;
  channel: "EMAIL" | "WHATSAPP";
  direction: string;
  recipientAddr: string | null;
  subject: string | null;
  body: string | null;
  status: string;
  externalId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

type Props = {
  entityType: "CONTACT" | "ORGANIZATION" | "LEDGER";
  entityId: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  QUEUED_AWAITING_PLUGIN_IMPL: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-200 text-green-900",
  FAILED: "bg-red-100 text-red-700",
  SKIPPED: "bg-gray-200 text-gray-600",
};

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "✉",
  WHATSAPP: "✆",
};

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function CommunicationLogPanel({ entityType, entityId }: Props) {
  const [items, setItems] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"ALL" | "EMAIL" | "WHATSAPP">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        entityType,
        entityId,
        limit: 50,
      };
      if (channelFilter !== "ALL") params.channel = channelFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get("/admin/customer-portal/communication-log", { params });
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to load communication log";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, channelFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
          <p className="text-sm text-gray-500">{total} total entries</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as "ALL" | "EMAIL" | "WHATSAPP")}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="ALL">All Channels</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">All Status</option>
            <option value="QUEUED_AWAITING_PLUGIN_IMPL">Queued</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
          <button
            type="button"
            onClick={fetchLogs}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="p-4 text-center text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-center text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="p-8 text-center text-gray-400">No communication history yet</div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {items.map((entry) => (
            <li
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="cursor-pointer p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg" aria-hidden="true">
                    {CHANNEL_ICONS[entry.channel] ?? "•"}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {entry.recipientAddr ?? "(no recipient)"}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          STATUS_COLORS[entry.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {entry.subject && (
                      <div className="mt-1 text-sm text-gray-700">{entry.subject}</div>
                    )}
                    {entry.errorMessage && (
                      <div className="mt-1 text-xs text-red-600">Error: {entry.errorMessage}</div>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>Created: {formatTimestamp(entry.createdAt)}</div>
                  {entry.sentAt && <div>Sent: {formatTimestamp(entry.sentAt)}</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold">Communication Detail</h4>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-gray-600">Channel</dt>
                <dd>{selectedEntry.channel}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Recipient</dt>
                <dd>{selectedEntry.recipientAddr ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Status</dt>
                <dd>{selectedEntry.status}</dd>
              </div>
              {selectedEntry.subject && (
                <div>
                  <dt className="font-semibold text-gray-600">Subject</dt>
                  <dd>{selectedEntry.subject}</dd>
                </div>
              )}
              {selectedEntry.body && (
                <div>
                  <dt className="font-semibold text-gray-600">Body</dt>
                  <dd className="whitespace-pre-wrap rounded bg-gray-50 p-3 font-mono text-xs">
                    {selectedEntry.body}
                  </dd>
                </div>
              )}
              {selectedEntry.externalId && (
                <div>
                  <dt className="font-semibold text-gray-600">External ID</dt>
                  <dd className="font-mono text-xs">{selectedEntry.externalId}</dd>
                </div>
              )}
              {selectedEntry.errorMessage && (
                <div>
                  <dt className="font-semibold text-red-600">Error</dt>
                  <dd className="text-red-700">{selectedEntry.errorMessage}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-gray-600">Timestamps</dt>
                <dd className="text-xs">
                  <div>Created: {formatTimestamp(selectedEntry.createdAt)}</div>
                  {selectedEntry.sentAt && <div>Sent: {formatTimestamp(selectedEntry.sentAt)}</div>}
                  {selectedEntry.deliveredAt && (
                    <div>Delivered: {formatTimestamp(selectedEntry.deliveredAt)}</div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
