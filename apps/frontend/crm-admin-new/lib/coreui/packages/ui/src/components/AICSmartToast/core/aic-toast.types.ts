/**
 * AICToast component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-toast.component.ts
 */

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

/** Toast severity level controlling color and icon. */
export type AICToastSeverity = 'success' | 'info' | 'warning' | 'error';

// ---------------------------------------------------------------------------
// Toast message
// ---------------------------------------------------------------------------

/** Represents a single toast notification message. */
export interface AICToastMessage {
  /** Unique identifier for the toast instance. */
  id: string;
  /** Severity level controlling appearance. */
  severity: AICToastSeverity;
  /** Optional short summary (displayed as bold title). */
  summary?: string;
  /** Detail text of the toast notification. */
  detail: string;
  /** Auto-dismiss lifetime in milliseconds. 0 = persistent (no auto-dismiss). */
  life?: number;
}

// ---------------------------------------------------------------------------
// AICToastProps — framework-agnostic
// ---------------------------------------------------------------------------

/** Core props for the AICToast container component. */
export interface AICToastProps {
  /** Array of toast messages to display. */
  messages: AICToastMessage[];
  /** Callback invoked when a toast should be removed (by id). */
  onRemove?: (id: string) => void;
  /** Additional CSS class name(s). */
  className?: string;
}
