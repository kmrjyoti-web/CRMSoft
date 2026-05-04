/**
 * React AICDialogButton component.
 * A button that opens a AICConfirmDialog on click.
 *
 * Source: Angular dialog-button.component.ts
 */

import React, { useCallback, useState } from "react";

import {
  cn,
  getDialogButtonColorClasses,
} from "@coreui/ui";

import type { AICButtonVariant, DialogType } from "@coreui/ui";

import { AICConfirmDialog } from "../AICConfirmDialog/AICConfirmDialog";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICDialogButton props.
 */
export interface DialogButtonProps {
  /** Visual style variant for the trigger button. */
  variant?: AICButtonVariant;
  /** Primary label text. */
  label?: string;
  /** AICButton label text (alias for label). */
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
  onConfirm?: () => void;
  /** Callback fired when the dialog cancel action is triggered. */
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Size classes
// ---------------------------------------------------------------------------

const SIZE_CLASSES: Record<string, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-1.5 text-base",
  lg: "px-5 py-2 text-lg",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICDialogButton built on the shared core logic from `@coreui/ui`.
 *
 * Renders a styled button that opens a AICConfirmDialog when clicked.
 * The dialog is managed internally — the consumer receives `onConfirm`
 * and `onCancel` callbacks.
 */
export const AICDialogButton = React.forwardRef<
  HTMLButtonElement,
  DialogButtonProps
>((props, ref) => {
  const {
    variant = "primary",
    label,
    buttonLabel,
    icon,
    suffixIcon,
    image,
    fullWidth = false,
    size = "md",
    dialogTitle = "Confirm",
    dialogMessage = "Are you sure?",
    dialogType,
    confirmText = "Confirm",
    cancelText = "Cancel",
    disabled = false,
    className,
    onConfirm,
    onCancel,
  } = props;

  const displayLabel = buttonLabel ?? label;

  // -----------------------------------------------------------------------
  // Dialog open state
  // -----------------------------------------------------------------------

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    setIsDialogOpen(true);
  }, [disabled]);

  const handleConfirm = useCallback(() => {
    setIsDialogOpen(false);
    onConfirm?.();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    onCancel?.();
  }, [onCancel]);

  // -----------------------------------------------------------------------
  // Style composition
  // -----------------------------------------------------------------------

  const colorClasses = getDialogButtonColorClasses(variant, dialogType);
  const sizeClasses = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1",
    colorClasses,
    sizeClasses,
    fullWidth && "w-full flex",
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={classes}
        onClick={handleButtonClick}
        data-testid="dialog-button"
      >
        {/* Prefix icon */}
        {icon && (
          <span className="inline-flex shrink-0" data-testid="dialog-button-icon">
            {icon}
          </span>
        )}

        {/* Image */}
        {image && (
          <img
            src={image}
            alt=""
            className="h-5 w-5 object-contain"
            data-testid="dialog-button-image"
          />
        )}

        {/* Label */}
        {displayLabel && <span>{displayLabel}</span>}

        {/* Suffix icon */}
        {suffixIcon && (
          <span className="inline-flex shrink-0" data-testid="dialog-button-suffix-icon">
            {suffixIcon}
          </span>
        )}
      </button>

      {/* Confirm dialog */}
      <AICConfirmDialog
        isOpen={isDialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
});

AICDialogButton.displayName = "AICDialogButton";
