/**
 * SyncIndicator pure logic functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular sync-indicator.component.ts
 */

import type { SyncStatus } from "./sync-indicator.types";

// ---------------------------------------------------------------------------
// Status text color
// ---------------------------------------------------------------------------

/**
 * Returns the text color class for a given sync status.
 */
export function getSyncStatusColor(status: SyncStatus): string {
  const map: Record<SyncStatus, string> = {
    synced: "text-green-600",
    syncing: "text-blue-600",
    offline: "text-red-600",
    error: "text-red-600",
  };
  return map[status] || map.synced;
}

// ---------------------------------------------------------------------------
// Dot background color
// ---------------------------------------------------------------------------

/**
 * Returns the background color class for the status indicator dot.
 */
export function getSyncDotColor(status: SyncStatus): string {
  const map: Record<SyncStatus, string> = {
    synced: "bg-green-500",
    syncing: "bg-blue-500",
    offline: "bg-red-500",
    error: "bg-red-500",
  };
  return map[status] || map.synced;
}

// ---------------------------------------------------------------------------
// Status label
// ---------------------------------------------------------------------------

/**
 * Returns the human-readable label for the current sync status.
 */
export function getSyncStatusLabel(
  status: SyncStatus,
  pendingCount: number,
): string {
  if (status === "syncing") return "Syncing...";
  if (status === "offline") return "Offline";
  if (status === "error") return "Error";
  return pendingCount > 0 ? `${pendingCount} Pending` : "Synced";
}

// ---------------------------------------------------------------------------
// Last sync time formatter
// ---------------------------------------------------------------------------

/**
 * Formats the last sync time for display. Returns null if no time is provided.
 */
export function formatLastSyncTime(time?: Date | string): string | null {
  if (!time) return null;
  const d = typeof time === "string" ? new Date(time) : time;
  return d.toLocaleTimeString();
}
