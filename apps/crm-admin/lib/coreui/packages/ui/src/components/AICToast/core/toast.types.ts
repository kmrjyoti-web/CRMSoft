/**
 * Toast component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Variant & Position unions
// ---------------------------------------------------------------------------

/** Visual style variants for the Toast component. */
export type ToastVariant = "info" | "success" | "warning" | "error";

/** Screen position where the toast stack is rendered. */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// ---------------------------------------------------------------------------
// ToastData
// ---------------------------------------------------------------------------

/**
 * Data structure representing a single toast notification.
 */
export interface ToastData {
  /** Unique identifier for the toast. */
  id: string;
  /** Optional title text. */
  title?: string;
  /** Optional description / body text. */
  description?: string;
  /** Visual variant determining the icon and accent colour. */
  variant: ToastVariant;
  /** Auto-dismiss duration in milliseconds. 0 = persistent. Default 5000. */
  duration?: number;
  /** Optional action button configuration. */
  action?: {
    /** Label text for the action button. */
    label: string;
  };
  /** Timestamp of when the toast was created. */
  createdAt: number;
}

// ---------------------------------------------------------------------------
// ToastConfig
// ---------------------------------------------------------------------------

/**
 * Global configuration for the toast system.
 */
export interface ToastConfig {
  /** Screen position for the toast stack. */
  position?: ToastPosition;
  /** Maximum number of visible toasts at once. Default 5. */
  maxVisible?: number;
  /** Default auto-dismiss duration in milliseconds. Default 5000. */
  defaultDuration?: number;
}
