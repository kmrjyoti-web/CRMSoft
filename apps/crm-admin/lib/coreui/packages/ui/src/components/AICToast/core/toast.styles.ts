/**
 * Toast style composition.
 * Combines base classes, variant, position, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import {
  toastVariantStyles,
  toastVariantIconColors,
  toastPositionStyles,
} from "./toast.variants";
import type { ToastVariant, ToastPosition } from "./toast.types";

// ---------------------------------------------------------------------------
// Toast card styles
// ---------------------------------------------------------------------------

/** Props accepted by getToastStyles. */
export interface GetToastStylesProps {
  variant?: ToastVariant;
  className?: string;
}

/** Base classes shared by every toast card. */
const TOAST_BASE_CLASSES =
  "relative flex items-start gap-3 w-[360px] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] p-4 pointer-events-auto";

/**
 * Returns a single, merged class string for a toast card.
 *
 * @param props - Subset of toast props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getToastStyles(props: GetToastStylesProps): string {
  const { variant = "info", className } = props;

  return cn(
    TOAST_BASE_CLASSES,
    toastVariantStyles[variant],
    className,
  );
}

// ---------------------------------------------------------------------------
// Toast container styles
// ---------------------------------------------------------------------------

/** Props accepted by getToastContainerStyles. */
export interface GetToastContainerStylesProps {
  position?: ToastPosition;
}

/**
 * Returns the Tailwind class string for the toast stack container.
 *
 * @param props - Position configuration.
 * @returns Merged Tailwind class string.
 */
export function getToastContainerStyles(props: GetToastContainerStylesProps): string {
  const { position = "top-right" } = props;

  return cn(
    "fixed flex flex-col gap-2 pointer-events-none",
    toastPositionStyles[position],
  );
}

// ---------------------------------------------------------------------------
// Dismiss button styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the toast dismiss / close button.
 */
export function getToastDismissButtonStyles(): string {
  return cn(
    "inline-flex items-center justify-center",
    "h-6 w-6 rounded-[var(--radius-sm)]",
    "text-[var(--color-text-secondary)]",
    "hover:bg-[var(--color-bg-secondary)]",
    "hover:text-[var(--color-text)]",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
    "shrink-0",
  );
}

// ---------------------------------------------------------------------------
// Icon styles
// ---------------------------------------------------------------------------

/** Props accepted by getToastIconStyles. */
export interface GetToastIconStylesProps {
  variant?: ToastVariant;
}

/**
 * Returns the Tailwind class string for the toast variant icon.
 *
 * @param props - Variant configuration.
 * @returns Merged Tailwind class string.
 */
export function getToastIconStyles(props: GetToastIconStylesProps): string {
  const { variant = "info" } = props;

  return cn(
    "shrink-0 mt-0.5",
    toastVariantIconColors[variant],
  );
}

// ---------------------------------------------------------------------------
// Action button styles
// ---------------------------------------------------------------------------

/**
 * Returns the Tailwind class string for the toast action button.
 */
export function getToastActionButtonStyles(): string {
  return cn(
    "inline-flex items-center justify-center",
    "px-3 py-1 rounded-[var(--radius-sm)]",
    "text-sm font-medium",
    "text-[var(--color-primary)]",
    "hover:bg-[var(--color-bg-secondary)]",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
  );
}
