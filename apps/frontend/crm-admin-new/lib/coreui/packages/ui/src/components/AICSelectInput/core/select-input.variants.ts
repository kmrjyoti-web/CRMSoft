/**
 * SelectInput size, variant, shape, and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  SelectInputSize,
  SelectInputVariant,
  SelectInputShape,
  SelectInputState,
} from "./select-input.types";

// ---------------------------------------------------------------------------
// Size → Tailwind classes
// ---------------------------------------------------------------------------

export const sizeStyles: Record<SelectInputSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

// ---------------------------------------------------------------------------
// Variant → Tailwind classes
// ---------------------------------------------------------------------------

export const variantStyles: Record<SelectInputVariant, string> = {
  outlined:
    "border bg-[var(--color-bg)] border-[var(--color-border)]",
  filled:
    "border border-transparent bg-[var(--color-bg-secondary)]",
};

// ---------------------------------------------------------------------------
// Shape → Tailwind classes
// ---------------------------------------------------------------------------

export const shapeStyles: Record<SelectInputShape, string> = {
  rounded: "rounded-[var(--radius-md)]",
  square: "rounded-none",
};

// ---------------------------------------------------------------------------
// State → Tailwind classes
// ---------------------------------------------------------------------------

export const stateStyles: Record<SelectInputState, string> = {
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

// ---------------------------------------------------------------------------
// Dropdown option styles
// ---------------------------------------------------------------------------

export const optionStyles = {
  base: "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors cursor-pointer",
  hover: "bg-[var(--color-bg-secondary)]",
  selected: "bg-[var(--color-bg-secondary)] font-medium",
  disabled: "opacity-50 cursor-not-allowed",
  highlighted: "bg-[var(--color-bg-secondary)]",
} as const;

export const groupHeaderStyles =
  "px-3 py-1 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider";
