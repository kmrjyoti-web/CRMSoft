/**
 * React AICError Dashboard component.
 * Dev-mode panel that displays recent error log entries with reload/clear
 * controls and a JSON detail popup for each entry.
 *
 * Source: Angular AICErrorDashboardComponent.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  cn,
  getRecentErrors,
  clearAllErrors,
  getErrorSeverityStyles,
} from "@coreui/ui";
import type { ErrorLogEntry } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AICErrorDashboardProps {
  /** Pre-supplied errors (overrides internal fetch). */
  errors?: ErrorLogEntry[];
  /** Reload callback -- called when the Reload button is pressed. */
  onReload?: () => Promise<void>;
  /** Clear callback -- called when the Clear All button is pressed. */
  onClear?: () => Promise<void>;
  /** Additional CSS class name(s). */
  className?: string;
}

// ---------------------------------------------------------------------------
// Inline SVG Icons
// ---------------------------------------------------------------------------

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICErrorDashboard: React.FC<AICErrorDashboardProps> = ({
  errors: externalErrors,
  onReload,
  onClear,
  className,
}) => {
  const [entries, setEntries] = useState<ErrorLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ErrorLogEntry | null>(null);

  // Fetch errors from the in-memory store (or use external prop)
  const loadErrors = useCallback(() => {
    if (externalErrors) {
      setEntries(externalErrors);
    } else {
      setEntries(getRecentErrors());
    }
  }, [externalErrors]);

  useEffect(() => {
    loadErrors();
  }, [loadErrors]);

  // ── Reload handler ──────────────────────────────────
  const handleReload = useCallback(async () => {
    setLoading(true);
    try {
      if (onReload) {
        await onReload();
      }
      loadErrors();
    } finally {
      setLoading(false);
    }
  }, [onReload, loadErrors]);

  // ── Clear handler ───────────────────────────────────
  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      if (onClear) {
        await onClear();
      } else {
        clearAllErrors();
      }
      setEntries([]);
      setSelectedEntry(null);
    } finally {
      setLoading(false);
    }
  }, [onClear]);

  // ── Detail popup close ──────────────────────────────
  const handleCloseDetail = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden",
        className,
      )}
      data-testid="aic-error-dashboard"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3
          className="text-sm font-semibold text-gray-700"
          data-testid="aic-error-dashboard-title"
        >
          Error Dashboard
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded",
              "border border-gray-300 bg-white text-gray-700",
              "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
            )}
            data-testid="aic-error-reload"
          >
            <RefreshIcon className={cn(loading && "animate-spin")} />
            Reload
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading || entries.length === 0}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded",
              "border border-red-300 bg-white text-red-600",
              "hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
            )}
            data-testid="aic-error-clear"
          >
            <TrashIcon />
            Clear All
          </button>
        </div>
      </div>

      {/* ── Loading ────────────────────────────────────── */}
      {loading && (
        <div
          className="flex items-center justify-center py-8"
          data-testid="aic-error-loading"
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────── */}
      {!loading && entries.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 text-gray-400"
          data-testid="aic-error-empty"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-gray-300"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="text-sm">No errors recorded</p>
        </div>
      )}

      {/* ── Error List ─────────────────────────────────── */}
      {!loading && entries.length > 0 && (
        <ul
          className="divide-y divide-gray-100 max-h-96 overflow-y-auto"
          data-testid="aic-error-list"
        >
          {entries.map((entry) => {
            const styles = getErrorSeverityStyles(entry.severity);
            return (
              <li
                key={entry.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer",
                  "hover:bg-gray-50 transition-colors",
                )}
                onClick={() => setSelectedEntry(entry)}
                data-testid={`aic-error-entry-${entry.id}`}
              >
                {/* Severity dot */}
                <span
                  className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", styles.icon.replace('text-', 'bg-'))}
                  data-testid={`aic-error-severity-${entry.id}`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded",
                        styles.bg,
                        styles.text,
                      )}
                      data-testid={`aic-error-type-badge-${entry.id}`}
                    >
                      {entry.type}
                    </span>

                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-[10px] font-medium uppercase rounded",
                        styles.bg,
                        styles.text,
                      )}
                      data-testid={`aic-error-severity-badge-${entry.id}`}
                    >
                      {entry.severity}
                    </span>

                    {entry.source && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {entry.source}
                      </span>
                    )}
                  </div>

                  <p
                    className="text-sm text-gray-700 truncate"
                    data-testid={`aic-error-message-${entry.id}`}
                  >
                    {entry.message}
                  </p>
                </div>

                {/* Timestamp */}
                <span
                  className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5"
                  data-testid={`aic-error-timestamp-${entry.id}`}
                >
                  {formatTimestamp(entry.timestamp)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── JSON Detail Popup (modal overlay) ──────────── */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={handleCloseDetail}
          data-testid="aic-error-detail-overlay"
        >
          <div
            className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
            data-testid="aic-error-detail-popup"
          >
            {/* Popup header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">
                Error Detail
                <span className="ml-2 text-xs font-normal text-gray-400">
                  #{selectedEntry.id}
                </span>
              </h4>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="inline-flex items-center justify-center p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close detail popup"
                data-testid="aic-error-detail-close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* JSON content */}
            <div className="p-4 max-h-80 overflow-auto">
              <pre
                className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words"
                data-testid="aic-error-detail-json"
              >
                {JSON.stringify(selectedEntry, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AICErrorDashboard.displayName = "AICErrorDashboard";
