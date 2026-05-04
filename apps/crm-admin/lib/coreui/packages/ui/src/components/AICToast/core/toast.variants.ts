/**
 * Toast variant and position style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { ToastVariant, ToastPosition } from "./toast.types";

// ---------------------------------------------------------------------------
// Variant → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ToastVariant` to the corresponding Tailwind utility classes
 * for the toast card border accent and background.
 */
export const toastVariantStyles: Record<ToastVariant, string> = {
  info: "border-l-4 border-l-[var(--color-primary)] bg-[var(--color-bg-elevated)]",
  success: "border-l-4 border-l-[var(--color-success)] bg-[var(--color-bg-elevated)]",
  warning: "border-l-4 border-l-[var(--color-warning)] bg-[var(--color-bg-elevated)]",
  error: "border-l-4 border-l-[var(--color-danger)] bg-[var(--color-bg-elevated)]",
};

// ---------------------------------------------------------------------------
// Variant → Icon color map
// ---------------------------------------------------------------------------

/**
 * Maps each `ToastVariant` to the text color class for the variant icon.
 */
export const toastVariantIconColors: Record<ToastVariant, string> = {
  info: "text-[var(--color-primary)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-danger)]",
};

// ---------------------------------------------------------------------------
// Position → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ToastPosition` to the fixed positioning classes that anchor
 * the toast stack container to the correct screen corner or edge.
 */
export const toastPositionStyles: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};
