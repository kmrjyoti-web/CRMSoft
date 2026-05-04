/**
 * ListCheckbox style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { ListCheckboxState } from "./list-checkbox.types";

// ---------------------------------------------------------------------------
// State → Tailwind classes
// ---------------------------------------------------------------------------

export const stateStyles: Record<ListCheckboxState, string> = {
  default:
    "focus-within:ring-1 focus-within:ring-[var(--color-border-focus)] focus-within:border-[var(--color-border-focus)]",
  focused:
    "ring-1 ring-[var(--color-border-focus)] border-[var(--color-border-focus)]",
  error:
    "border-[var(--color-danger)] focus-within:ring-1 focus-within:ring-[var(--color-danger)]",
  disabled: "opacity-50 cursor-not-allowed",
  readOnly: "bg-[var(--color-bg-secondary)]",
};

// ---------------------------------------------------------------------------
// Option item styles
// ---------------------------------------------------------------------------

export const optionItemStyles = {
  base: "flex items-center px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors",
  checked: "bg-[var(--color-border-focus)]/5",
  disabled: "opacity-50 cursor-not-allowed",
} as const;

// ---------------------------------------------------------------------------
// Chip styles
// ---------------------------------------------------------------------------

export const chipStyles = {
  base: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-border-focus)]/10 text-[var(--color-border-focus)] text-xs font-medium border border-[var(--color-border-focus)]/20 whitespace-nowrap",
  overflow:
    "inline-flex items-center px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-xs font-medium border border-[var(--color-border)] whitespace-nowrap",
} as const;
