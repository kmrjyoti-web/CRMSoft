/**
 * SyncIndicator component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular sync-indicator.component.ts
 */

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

/** Possible synchronization states. */
export type SyncStatus = "synced" | "syncing" | "offline" | "error";

// ---------------------------------------------------------------------------
// SyncIndicatorProps — framework-agnostic props
// ---------------------------------------------------------------------------

export interface SyncIndicatorProps {
  /** Current synchronization status. */
  status?: SyncStatus;
  /** Number of pending items waiting to sync. */
  pendingCount?: number;
  /** Timestamp of the last successful sync. */
  lastSyncTime?: Date | string;
  /** Additional CSS class name(s). */
  className?: string;
}
