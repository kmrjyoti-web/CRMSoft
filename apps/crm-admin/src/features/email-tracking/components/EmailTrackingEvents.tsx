"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge, Icon, Input, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useTrackingEvents } from "../hooks/useEmailTracking";
import type { EmailTrackingEvent, EmailTrackingFilters } from "../types/email-tracking.types";

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 24,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 12,
};

const titleGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const filtersRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
  flexWrap: "wrap",
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  background: "#f9fafb",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#6b7280",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderTop: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Event Type Options ────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  { label: "All Events", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "Click", value: "CLICK" },
  { label: "Bounce", value: "BOUNCE" },
];

// ── Event Type Badge ──────────────────────────────────────

function EventTypeBadge({ type }: { type: "OPEN" | "CLICK" | "BOUNCE" }) {
  const variantMap: Record<string, "primary" | "success" | "danger"> = {
    OPEN: "primary",
    CLICK: "success",
    BOUNCE: "danger",
  };

  const iconMap: Record<string, string> = {
    OPEN: "mail",
    CLICK: "external-link",
    BOUNCE: "alert-triangle",
  };

  return (
    <Badge variant={variantMap[type] ?? "default"}>
      <Icon name={iconMap[type] as "mail"} size={11} />
      {" "}
      {type}
    </Badge>
  );
}

// ── Main Component ─────────────────────────────────────────

export function EmailTrackingEvents() {
  const [eventType, setEventType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filters: EmailTrackingFilters = useMemo(() => ({
    eventType: (eventType as "OPEN" | "CLICK" | "BOUNCE") || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit: 25,
  }), [eventType, fromDate, toDate, page]);

  const { data, isLoading } = useTrackingEvents(filters);

  const events = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const meta = useMemo(() => {
    return data?.meta ?? null;
  }, [data]);

  const handleEventTypeChange = useCallback((value: string | number | boolean | null) => {
    setEventType(String(value ?? ""));
    setPage(1);
  }, []);

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const totalCount = meta?.total ?? events.length;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleGroupStyle}>
          <Icon name="activity" size={22} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Email Tracking Events</h2>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersRowStyle}>
        <div style={{ width: 200 }}>
          <SelectInput
            label="Event Type"
            value={eventType}
            onChange={handleEventTypeChange}
            options={EVENT_TYPE_OPTIONS}
            leftIcon={<Icon name="filter" size={16} />}
          />
        </div>
        <div style={{ width: 170 }}>
          <Input
            label="From Date"
            value={fromDate}
            onChange={(v) => { setFromDate(v); setPage(1); }}
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
        <div style={{ width: 170 }}>
          <Input
            label="To Date"
            value={toDate}
            onChange={(v) => { setToDate(v); setPage(1); }}
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && events.length === 0 && (
        <EmptyState
          icon="activity"
          title="No tracking events"
          description="No email tracking events found for the selected filters."
        />
      )}

      {/* Table */}
      {!isLoading && events.length > 0 && (
        <>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Email ID</th>
                  <th style={thStyle}>Event Type</th>
                  <th style={thStyle}>Recipient</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Clicked URL</th>
                  <th style={thStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: EmailTrackingEvent) => (
                  <tr key={event.id} style={{ background: "#fff" }}>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12, color: "#6b7280", maxWidth: 140 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.emailId}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <EventTypeBadge type={event.eventType} />
                    </td>
                    <td style={{ ...tdStyle, color: "#374151" }}>
                      {event.recipientEmail ?? "—"}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>
                        {event.subject ?? "—"}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 200 }}>
                      {event.clickedUrl ? (
                        <a
                          href={event.clickedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#3b82f6", textDecoration: "underline", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <Icon name="external-link" size={12} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                            {event.clickedUrl}
                          </span>
                        </a>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" }}>
                      {formatTimestamp(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total events)
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevious}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: meta.hasPrevious ? "pointer" : "not-allowed",
                    opacity: meta.hasPrevious ? 1 : 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                  }}
                >
                  <Icon name="chevron-left" size={14} /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNext}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: meta.hasNext ? "pointer" : "not-allowed",
                    opacity: meta.hasNext ? 1 : 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                  }}
                >
                  Next <Icon name="chevron-right" size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
