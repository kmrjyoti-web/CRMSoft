/**
 * React AICSyncIndicator component.
 * Small inline indicator with colored dot, status text, and optional
 * spinning icon for the syncing state. Shows last sync time as a tooltip.
 *
 * Source: Angular sync-indicator.component.ts
 */

import React from "react";

import {
  cn,
  getSyncStatusColor,
  getSyncDotColor,
  getSyncStatusLabel,
  formatLastSyncTime,
} from "@coreui/ui";

import type { SyncIndicatorProps as CoreSyncIndicatorProps } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SyncIndicatorProps extends CoreSyncIndicatorProps {}

// ---------------------------------------------------------------------------
// Spinning sync icon (inline SVG)
// ---------------------------------------------------------------------------

const SyncSpinnerIcon: React.FC = () => (
  <svg
    className="animate-spin h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    data-testid="sync-indicator-spinner"
  >
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICSyncIndicator: React.FC<SyncIndicatorProps> = (props) => {
  const {
    status = "synced",
    pendingCount = 0,
    lastSyncTime,
    className,
  } = props;

  const dotColor = getSyncDotColor(status);
  const textColor = getSyncStatusColor(status);
  const label = getSyncStatusLabel(status, pendingCount);
  const formattedTime = formatLastSyncTime(lastSyncTime);

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      title={formattedTime ? `Last synced: ${formattedTime}` : undefined}
      data-testid="sync-indicator"
    >
      {/* Status dot or spinner */}
      {status === "syncing" ? (
        <span className={cn(textColor)} data-testid="sync-indicator-dot">
          <SyncSpinnerIcon />
        </span>
      ) : (
        <span
          className={cn("inline-block w-2.5 h-2.5 rounded-full", dotColor)}
          data-testid="sync-indicator-dot"
        />
      )}

      {/* Status label */}
      <span
        className={cn("text-sm font-medium", textColor)}
        data-testid="sync-indicator-label"
      >
        {label}
      </span>

      {/* Last sync time */}
      {formattedTime && (
        <span
          className="text-xs text-gray-400"
          data-testid="sync-indicator-time"
        >
          {formattedTime}
        </span>
      )}
    </div>
  );
};

AICSyncIndicator.displayName = "AICSyncIndicator";
