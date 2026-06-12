/**
 * React AICDialog component.
 * AICModal overlay dialog with backdrop, configurable position, icon styles,
 * and confirm/cancel actions.
 *
 * Source: Angular aic-dialog.component.ts
 */

import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  cn,
  getOverlayPositionStyles,
  getIconBadgeClasses,
  getIconColorClass,
} from "@coreui/ui";

import type {
  DialogPosition,
  DialogVariant,
  DialogIconStyle,
  DialogIconLayout,
  AICDialogProps as CoreAICDialogProps,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props (extends core with React-specific children)
// ---------------------------------------------------------------------------

export interface AICDialogProps extends CoreAICDialogProps {
  /** Optional children rendered in the dialog body (overrides message). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Close icon SVG
// ---------------------------------------------------------------------------

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
// Component
// ---------------------------------------------------------------------------

export const AICDialog: React.FC<AICDialogProps> = (props) => {
  const {
    isOpen,
    title,
    message,
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    width,
    icon,
    dialogVariant = "info",
    iconStyle = "soft-circle",
    iconLayout = "inline",
    position = "center",
    closeOnOverlayClick = true,
    onConfirm,
    onCancel,
    className,
    children,
  } = props;

  // -----------------------------------------------------------------------
  // Escape key handler
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel?.();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // -----------------------------------------------------------------------
  // Overlay click handler
  // -----------------------------------------------------------------------

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onCancel?.();
      }
    },
    [closeOnOverlayClick, onCancel],
  );

  // -----------------------------------------------------------------------
  // Position styles
  // -----------------------------------------------------------------------

  const positionStyles = getOverlayPositionStyles(position);

  // -----------------------------------------------------------------------
  // Icon rendering
  // -----------------------------------------------------------------------

  const isLargeIcon = iconLayout === "center-large";
  const badgeClasses = getIconBadgeClasses(iconStyle, dialogVariant, isLargeIcon);
  const iconColorClass = getIconColorClass(iconStyle, dialogVariant);

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <div className={badgeClasses} data-testid="aic-dialog-icon">
        <span
          className={cn(
            iconColorClass,
            isLargeIcon ? "text-3xl" : "text-base",
          )}
        >
          {icon}
        </span>
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Variant-based confirm button styles
  // -----------------------------------------------------------------------

  const confirmButtonVariantStyles: Record<DialogVariant, string> = {
    info: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (!isOpen) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[10000]"
      data-testid="aic-dialog-overlay"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        data-testid="aic-dialog-backdrop"
      />

      {/* Positioning container */}
      <div
        className="absolute inset-0 flex p-4"
        style={{
          justifyContent: positionStyles.justifyContent,
          alignItems: positionStyles.alignItems,
        }}
        onClick={handleOverlayClick}
        data-testid="aic-dialog-position-container"
      >
        {/* Dialog panel */}
        <div
          className={cn(
            "relative bg-white rounded-lg shadow-xl",
            "transform transition-all duration-200",
            "max-h-[90vh] overflow-auto",
            className,
          )}
          style={{ width: width || "28rem" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "aic-dialog-title" : undefined}
          data-testid="aic-dialog-panel"
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-start gap-3 p-4 pb-0",
              isLargeIcon && "flex-col items-center text-center",
            )}
            data-testid="aic-dialog-header"
          >
            {renderIcon()}

            <div className={cn("flex-1 min-w-0", isLargeIcon && "w-full")}>
              {title && (
                <h2
                  id="aic-dialog-title"
                  className="text-lg font-semibold text-gray-900"
                  data-testid="aic-dialog-title"
                >
                  {title}
                </h2>
              )}
            </div>

            {/* Close X button */}
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1",
                "text-gray-400 hover:text-gray-600 transition-colors",
                isLargeIcon && "absolute top-3 right-3",
              )}
              onClick={onCancel}
              aria-label="Close dialog"
              data-testid="aic-dialog-close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div
            className={cn(
              "p-4 text-sm text-gray-600",
              isLargeIcon && "text-center",
            )}
            data-testid="aic-dialog-body"
          >
            {children || message}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 p-4 pt-2"
            data-testid="aic-dialog-footer"
          >
            {cancelLabel && (
              <button
                type="button"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md",
                  "border border-gray-300 text-gray-700",
                  "hover:bg-gray-50 transition-colors",
                )}
                onClick={onCancel}
                data-testid="aic-dialog-cancel"
              >
                {cancelLabel}
              </button>
            )}
            {confirmLabel && (
              <button
                type="button"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  confirmButtonVariantStyles[dialogVariant],
                )}
                onClick={onConfirm}
                data-testid="aic-dialog-confirm"
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};

AICDialog.displayName = "AICDialog";
