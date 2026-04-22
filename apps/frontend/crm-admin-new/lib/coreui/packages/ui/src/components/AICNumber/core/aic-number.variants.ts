/**
 * AICNumber size, variant, shape, and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  AICNumberSize,
  AICNumberVariant,
  AICNumberShape,
  AICNumberState,
} from "./aic-number.types";

// ---------------------------------------------------------------------------
// Size → Tailwind classes
// ---------------------------------------------------------------------------

export const sizeStyles: Record<AICNumberSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

export const spinnerButtonSizes: Record<AICNumberSize, string> = {
  sm: "h-5 w-5 text-xs",
  md: "h-6 w-6 text-sm",
  lg: "h-7 w-7 text-sm",
};

// ---------------------------------------------------------------------------
// Variant → Tailwind classes
// ---------------------------------------------------------------------------

export const variantStyles: Record<AICNumberVariant, string> = {
  outlined:
    "border bg-[var(--color-bg)] border-[var(--color-border)]",
  filled:
    "border border-transparent bg-[var(--color-bg-secondary)]",
  standard:
    "border-b border-l-0 border-r-0 border-t-0 rounded-none bg-transparent border-[var(--color-border)]",
};

// ---------------------------------------------------------------------------
// Shape → Tailwind classes
// ---------------------------------------------------------------------------

export const shapeStyles: Record<AICNumberShape, string> = {
  rounded: "rounded-[var(--radius-md)]",
  square: "rounded-none",
};

// ---------------------------------------------------------------------------
// State → Tailwind classes
// ---------------------------------------------------------------------------

export const stateStyles: Record<AICNumberState, string> = {
  default:
    "focus-within:border-[var(--color-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]/20",
  focused:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  error:
    "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20",
  disabled:
    "opacity-50 cursor-not-allowed",
  readOnly:
    "bg-[var(--color-bg-secondary)]",
};
