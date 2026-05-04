/**
 * DialogButton component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular dialog-button.component.ts
 */

import type { DialogType } from "../../../core/models";
import type { ButtonVariant } from "../../AICButton/core";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the DialogButton component.
 * A button that opens a confirm dialog on click.
 * Framework adapters extend this with their own callback types.
 */
export interface DialogButtonProps<
  OnConfirm = () => void,
  OnCancel = () => void,
> {
  /** Visual style variant for the trigger button. */
  variant?: ButtonVariant;
  /** Primary label text. */
  label?: string;
  /** Button label text (alias for label). */
  buttonLabel?: string;
  /** Prefix icon name. */
  icon?: string;
  /** Suffix icon name. */
  suffixIcon?: string;
  /** Image URL for button content. */
  image?: string;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Size preset for the button. */
  size?: "sm" | "md" | "lg";
  /** Title for the confirm dialog. */
  dialogTitle?: string;
  /** Message body for the confirm dialog. */
  dialogMessage?: string;
  /** Dialog type — determines icon, colors, and confirm button styling. */
  dialogType?: DialogType;
  /** Text for the dialog confirm button. */
  confirmText?: string;
  /** Text for the dialog cancel button. */
  cancelText?: string;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Callback fired when the dialog confirm action is triggered. */
  onConfirm?: OnConfirm;
  /** Callback fired when the dialog cancel action is triggered. */
  onCancel?: OnCancel;
}
