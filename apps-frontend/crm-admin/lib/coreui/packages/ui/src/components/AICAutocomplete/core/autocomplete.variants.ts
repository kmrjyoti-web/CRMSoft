/**
 * Autocomplete size, variant, shape, and state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type {
  AutocompleteSize,
  AutocompleteVariant,
  AutocompleteShape,
  AutocompleteState,
} from "./autocomplete.types";

export const sizeStyles: Record<AutocompleteSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

export const variantStyles: Record<AutocompleteVariant, string> = {
  outlined: "border bg-[var(--color-bg)] border-[var(--color-border)]",
  filled: "border border-transparent bg-[var(--color-bg-secondary)]",
};

export const shapeStyles: Record<AutocompleteShape, string> = {
  rounded: "rounded-[var(--radius-md)]",
  square: "rounded-none",
};

export const stateStyles: Record<AutocompleteState, string> = {
  default:
    "focus-within:border-[var(--color-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]/20",
  focused:
    "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20",
  error:
    "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20",
  disabled: "opacity-50 cursor-not-allowed",
  readOnly: "bg-[var(--color-bg-secondary)]",
};
