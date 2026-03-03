/**
 * MultiSelectInput size, variant, shape, and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  MultiSelectSize,
  MultiSelectVariant,
  MultiSelectShape,
  MultiSelectState,
} from "./multi-select-input.types";

export const sizeStyles: Record<MultiSelectSize, string> = {
  sm: "min-h-[2rem] text-sm",
  md: "min-h-[2.5rem] text-sm",
  lg: "min-h-[3rem] text-base",
};

export const variantStyles: Record<MultiSelectVariant, string> = {
  outlined: "border bg-[var(--color-bg)] border-[var(--color-border)]",
  filled: "border border-transparent bg-[var(--color-bg-secondary)]",
};

export const shapeStyles: Record<MultiSelectShape, string> = {
  rounded: "rounded-[var(--radius-md)]",
  square: "rounded-none",
};

export const stateStyles: Record<MultiSelectState, string> = {
  default:
    "focus-within:border-[var(--color-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]/20",
  focused:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  error:
    "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20",
  disabled: "opacity-50 cursor-not-allowed",
  readOnly: "bg-[var(--color-bg-secondary)]",
};
