/**
 * React AICToastContainer component.
 * Renders the toast notification stack in a AICPortal.
 */

import React, { useEffect, useRef, useCallback, useState } from "react";

import {
  getToastStyles,
  getToastContainerStyles,
  getToastDismissButtonStyles,
  getToastIconStyles,
  getToastActionButtonStyles,
  getToastA11yProps,
  getToastRegionA11yProps,
  getAnimationClasses,
} from "@coreui/ui";

import type {
  ToastData,
  ToastVariant,
  ToastPosition,
  AnimationState,
} from "@coreui/ui";

import { AICPortal } from "../AICPortal";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useToastState, useToastStore } from "./aic-toast-context";

// ---------------------------------------------------------------------------
// Variant Icons
// ---------------------------------------------------------------------------

/** Inline SVG icons for each toast variant. */
const VariantIcon: React.FC<{ variant: ToastVariant }> = ({ variant }) => {
  const iconStyles = getToastIconStyles({ variant });

  switch (variant) {
    case "info":
      return (
        <svg
          className={iconStyles}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M10 9v5M10 6h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "success":
      return (
        <svg
          className={iconStyles}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M6.5 10l2.5 2.5 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "warning":
      return (
        <svg
          className={iconStyles}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 2L1 18h18L10 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 8v4M10 14h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "error":
      return (
        <svg
          className={iconStyles}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M13 7l-6 6M7 7l6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

VariantIcon.displayName = "VariantIcon";

// ---------------------------------------------------------------------------
// Individual Toast Item
// ---------------------------------------------------------------------------

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  onPause,
  onResume,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { state: animState, isMounted } = useAnimationState(isVisible, 200);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const remainingRef = useRef(toast.duration ?? 5000);
  const startTimeRef = useRef(Date.now());

  // Clear any existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start the auto-dismiss countdown
  const startTimer = useCallback(() => {
    const duration = remainingRef.current;
    if (duration <= 0) return; // persistent toast (duration === 0)

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation before actually dismissing
      setTimeout(() => {
        onDismiss(toast.id);
      }, 200);
    }, duration);
  }, [toast.id, onDismiss]);

  // Start timer on mount
  useEffect(() => {
    if (toast.duration !== 0) {
      startTimer();
    }
    return () => {
      clearTimer();
    };
  }, [toast.duration, startTimer, clearTimer]);

  // Pause on mouse enter
  const handleMouseEnter = useCallback(() => {
    if (isPausedRef.current || toast.duration === 0) return;
    isPausedRef.current = true;
    clearTimer();
    // Calculate remaining time
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    onPause(toast.id);
  }, [toast.id, toast.duration, clearTimer, onPause]);

  // Resume on mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isPausedRef.current || toast.duration === 0) return;
    isPausedRef.current = false;
    startTimer();
    onResume(toast.id);
  }, [toast.id, toast.duration, startTimer, onResume]);

  // Dismiss on close button click
  const handleDismissClick = useCallback(() => {
    clearTimer();
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [toast.id, clearTimer, onDismiss]);

  // Styles
  const toastStyles = getToastStyles({ variant: toast.variant });
  const dismissStyles = getToastDismissButtonStyles();
  const actionStyles = getToastActionButtonStyles();
  const a11yProps = getToastA11yProps({ variant: toast.variant });

  const animationClasses = getAnimationClasses(
    { type: "slide-right", duration: "normal" },
    animState as AnimationState,
  );

  if (!isMounted) return null;

  return (
    <div
      className={`${toastStyles} ${animationClasses.base} ${animationClasses.state}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...a11yProps}
    >
      {/* Icon */}
      <VariantIcon variant={toast.variant} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            className={`${actionStyles} mt-2`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        className={dismissStyles}
        onClick={handleDismissClick}
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 3L3 11M3 3l8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

ToastItem.displayName = "ToastItem";

// ---------------------------------------------------------------------------
// AICToastContainer
// ---------------------------------------------------------------------------

/** Props for the AICToastContainer. */
export interface ToastContainerProps {
  /** Override the position from the provider config. */
  position?: ToastPosition;
}

/**
 * Renders the toast notification stack.
 * Must be used within a AICToastProvider.
 *
 * Renders all active toasts inside a AICPortal at the "toast" z-index level.
 * Each toast has:
 * - Slide-in/out animation
 * - Auto-dismiss timer
 * - Pause on hover, resume on leave
 * - Dismiss button
 * - Optional action button
 * - Per-variant icon
 */
export const AICToastContainer: React.FC<ToastContainerProps> = ({
  position: positionOverride,
}) => {
  const toastState = useToastState();
  const store = useToastStore();

  const resolvedPosition = positionOverride ?? store.config.position;

  const containerStyles = getToastContainerStyles({
    position: resolvedPosition,
  });
  const regionA11y = getToastRegionA11yProps();

  const handleDismiss = useCallback(
    (id: string) => {
      store.dispatch({ type: "DISMISS", id });
    },
    [store],
  );

  const handlePause = useCallback(
    (id: string) => {
      store.dispatch({ type: "PAUSE", id });
    },
    [store],
  );

  const handleResume = useCallback(
    (id: string) => {
      store.dispatch({ type: "RESUME", id });
    },
    [store],
  );

  if (toastState.toasts.length === 0) return null;

  return (
    <AICPortal level="toast">
      <div className={containerStyles} {...regionA11y}>
        {toastState.toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={handleDismiss}
            onPause={handlePause}
            onResume={handleResume}
          />
        ))}
      </div>
    </AICPortal>
  );
};

AICToastContainer.displayName = "AICToastContainer";
