/**
 * React AICToast component.
 * Toast notification system with severity types, auto-dismiss, and stacking.
 *
 * Source: Angular aic-toast.component.ts
 */

import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import {
  cn,
  getToastSeverityStyles,
  getAICToastIconName,
} from "@coreui/ui";

import type {
  AICToastMessage,
  AICToastSeverity,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AICSmartToastProps {
  /** Array of toast messages to display. */
  messages: AICToastMessage[];
  /** Callback invoked when a toast should be removed (by id). */
  onRemove?: (id: string) => void;
  /** Additional CSS class name(s). */
  className?: string;
}

// ---------------------------------------------------------------------------
// Severity Icon SVGs
// ---------------------------------------------------------------------------

const SuccessIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ICON_MAP: Record<AICToastSeverity, React.FC<{ className?: string }>> = {
  success: SuccessIcon,
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
};

// ---------------------------------------------------------------------------
// Single Toast Item
// ---------------------------------------------------------------------------

interface ToastItemProps {
  message: AICToastMessage;
  onRemove?: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, onRemove }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = getToastSeverityStyles(message.severity);
  const IconComponent = ICON_MAP[message.severity] || InfoIcon;

  // Auto-dismiss
  useEffect(() => {
    const life = message.life ?? 3000;
    if (life === 0) return;

    timerRef.current = setTimeout(() => {
      onRemove?.(message.id);
    }, life);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message.id, message.life, onRemove]);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onRemove?.(message.id);
  }, [message.id, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-md shadow-lg border-l-4",
        "bg-white",
        "animate-[slideIn_0.3s_ease-out]",
        styles.border,
        styles.bg,
      )}
      role="alert"
      data-testid={`aic-toast-item-${message.id}`}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 mt-0.5", styles.iconColor)} data-testid={`aic-toast-icon-${message.id}`}>
        <IconComponent />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {message.summary && (
          <p
            className="text-sm font-semibold text-gray-900"
            data-testid={`aic-toast-summary-${message.id}`}
          >
            {message.summary}
          </p>
        )}
        <p
          className="text-sm text-gray-600"
          data-testid={`aic-toast-detail-${message.id}`}
        >
          {message.detail}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        className="flex-shrink-0 inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={handleClose}
        aria-label="Close toast"
        data-testid={`aic-toast-close-${message.id}`}
      >
        <CloseIcon />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// AICToast Container
// ---------------------------------------------------------------------------

export const AICSmartToast: React.FC<AICSmartToastProps> = ({
  messages,
  onRemove,
  className,
}) => {
  if (messages.length === 0) return null;

  const container = (
    <div
      className={cn(
        "fixed top-4 right-4 z-[9999]",
        "flex flex-col gap-2",
        "w-80 max-w-[calc(100vw-2rem)]",
        className,
      )}
      data-testid="aic-toast-container"
    >
      {messages.map((msg: AICToastMessage) => (
        <ToastItem key={msg.id} message={msg} onRemove={onRemove} />
      ))}
    </div>
  );

  return createPortal(container, document.body);
};

AICSmartToast.displayName = "AICSmartToast";
