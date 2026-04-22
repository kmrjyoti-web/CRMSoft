/**
 * React AICConfirmDialog component.
 * AICModal overlay with type-based icon, title, message, and confirm/cancel actions.
 *
 * Source: Angular confirm-dialog.component.ts
 */

import React, { useCallback, useEffect } from "react";

import {
  cn,
  getDialogIconBgClass,
  getDialogIconTextClass,
  getDialogConfirmButtonClass,
  getDialogIconName,
} from "@coreui/ui";

import type { DialogType } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICConfirmDialog props.
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is currently open/visible. */
  isOpen: boolean;
  /** Dialog title. */
  title: string;
  /** Dialog message body. */
  message: string;
  /** Dialog type — determines icon, colors, and confirm button styling. */
  type?: DialogType;
  /** Text for the confirm button. */
  confirmText?: string;
  /** Text for the cancel button. */
  cancelText?: string;
  /** Whether to show the cancel button. */
  showCancel?: boolean;
  /** Callback fired when the confirm action is triggered. */
  onConfirm: () => void;
  /** Callback fired when the cancel action is triggered. */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Icon SVGs
// ---------------------------------------------------------------------------

const DialogIcon: React.FC<{ type: DialogType }> = ({ type }) => {
  const iconName = getDialogIconName(type);

  if (iconName === "trash") {
    return (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    );
  }

  if (iconName === "checkCircle") {
    return (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    );
  }

  // shieldCheck — used for info and warning
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICConfirmDialog built on the shared core logic from `@coreui/ui`.
 *
 * Renders a modal overlay with backdrop blur, type-based icon circle,
 * title, message, and confirm/cancel action buttons.
 */
export const AICConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const {
    isOpen,
    title,
    message,
    type = "info",
    confirmText = "Confirm",
    cancelText = "Cancel",
    showCancel = true,
    onConfirm,
    onCancel,
  } = props;

  // -----------------------------------------------------------------------
  // Escape key handler
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // -----------------------------------------------------------------------
  // Backdrop click handler
  // -----------------------------------------------------------------------

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  // -----------------------------------------------------------------------
  // Do not render when closed
  // -----------------------------------------------------------------------

  if (!isOpen) return null;

  // -----------------------------------------------------------------------
  // Style classes
  // -----------------------------------------------------------------------

  const iconBgClass = getDialogIconBgClass(type);
  const iconTextClass = getDialogIconTextClass(type);
  const confirmBtnClass = getDialogConfirmButtonClass(type);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      data-testid="confirm-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200"
        data-testid="confirm-dialog-panel"
      >
        {/* Icon circle */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full",
              iconBgClass,
              iconTextClass,
            )}
            data-testid="confirm-dialog-icon"
          >
            <DialogIcon type={type} />
          </div>
        </div>

        {/* Title */}
        <h3
          id="confirm-dialog-title"
          className="text-lg font-semibold text-gray-900 text-center mb-2"
          data-testid="confirm-dialog-title"
        >
          {title}
        </h3>

        {/* Message */}
        <p
          id="confirm-dialog-message"
          className="text-sm text-gray-500 text-center mb-6"
          data-testid="confirm-dialog-message"
        >
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          {showCancel && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={onCancel}
              data-testid="confirm-dialog-cancel"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2",
              confirmBtnClass,
            )}
            onClick={onConfirm}
            data-testid="confirm-dialog-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

AICConfirmDialog.displayName = "AICConfirmDialog";
