/**
 * ConfirmDialog component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular confirm-dialog.component.ts
 */

import type {
  DialogType,
  ConfirmDialogConfig,
} from "../../../core/models";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the ConfirmDialog component.
 * Extends ConfirmDialogConfig with open state and callback handlers.
 * Framework adapters use this directly.
 */
export interface ConfirmDialogProps extends ConfirmDialogConfig {
  /** Whether the dialog is currently open/visible. */
  isOpen: boolean;
  /** Callback fired when the confirm action is triggered. */
  onConfirm: () => void;
  /** Callback fired when the cancel action is triggered. */
  onCancel: () => void;
}

// Re-export for convenience
export type { DialogType, ConfirmDialogConfig };
