/**
 * AICDialog component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-dialog.component.ts
 */

// ---------------------------------------------------------------------------
// Position, Variant, Icon enums
// ---------------------------------------------------------------------------

/** Position of the dialog within the overlay. */
export type DialogPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Semantic variant controlling the dialog color theme. */
export type DialogVariant = 'info' | 'success' | 'warning' | 'error';

/** Icon badge styling mode. */
export type DialogIconStyle = 'plain' | 'soft-circle' | 'filled-circle';

/** Icon layout within the dialog header. */
export type DialogIconLayout = 'inline' | 'center-large';

// ---------------------------------------------------------------------------
// AICDialogConfig — framework-agnostic configuration
// ---------------------------------------------------------------------------

export interface AICDialogConfig {
  /** Dialog title text. */
  title?: string;
  /** Dialog body message. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel?: string;
  /** Label for the cancel button. */
  cancelLabel?: string;
  /** Custom width for the dialog panel (CSS value, e.g. '500px'). */
  width?: string;
  /** Icon name to display in the header. */
  icon?: string;
  /** Semantic color variant. */
  dialogVariant?: DialogVariant;
  /** Icon badge style. */
  iconStyle?: DialogIconStyle;
  /** Icon layout within the header. */
  iconLayout?: DialogIconLayout;
  /** Position of the dialog within the overlay. */
  position?: DialogPosition;
  /** Whether clicking the overlay backdrop closes the dialog. */
  closeOnOverlayClick?: boolean;
}

// ---------------------------------------------------------------------------
// AICDialogProps — extended with interaction callbacks
// ---------------------------------------------------------------------------

export interface AICDialogProps extends AICDialogConfig {
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Callback invoked when the confirm action is triggered. */
  onConfirm?: () => void;
  /** Callback invoked when the cancel/close action is triggered. */
  onCancel?: () => void;
  /** Additional CSS class name(s). */
  className?: string;
}
