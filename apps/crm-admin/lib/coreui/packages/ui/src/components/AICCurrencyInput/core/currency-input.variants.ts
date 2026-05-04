/**
 * CurrencyInput size, variant, shape, and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  CurrencyInputSize,
  CurrencyInputVariant,
  CurrencyInputShape,
  CurrencyInputState,
} from "./currency-input.types";

// ---------------------------------------------------------------------------
// Size → Tailwind classes
// ---------------------------------------------------------------------------

export const sizeStyles: Record<CurrencyInputSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

// ---------------------------------------------------------------------------
// Variant → Tailwind classes
// ---------------------------------------------------------------------------

export const variantStyles: Record<CurrencyInputVariant, string> = {
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

export const shapeStyles: Record<CurrencyInputShape, string> = {
  rounded: "rounded-[var(--radius-md)]",
  square: "rounded-none",
};

// ---------------------------------------------------------------------------
// State → Tailwind classes
// ---------------------------------------------------------------------------

export const stateStyles: Record<CurrencyInputState, string> = {
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
