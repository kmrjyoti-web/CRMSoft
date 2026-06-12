/**
 * ToggleButton state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular toggle-button.component.ts — exact port.
 */

import type { ToggleButtonSize } from "./toggle-button.types";

// ---------------------------------------------------------------------------
// Size styles — port of Angular sizeStyles()
// ---------------------------------------------------------------------------

export interface ToggleButtonSizeConfig {
  button: string;
  icon: string;
}

export const toggleButtonSizeStyles: Record<
  ToggleButtonSize,
  ToggleButtonSizeConfig
> = {
  sm: {
    button: "px-3 py-1 text-sm",
    icon: "w-4 h-4",
  },
  md: {
    button: "px-4 py-1.5 text-base",
    icon: "w-5 h-5",
  },
  lg: {
    button: "px-5 py-2 text-lg",
    icon: "w-6 h-6",
  },
};

// ---------------------------------------------------------------------------
// Active/inactive style classes
// ---------------------------------------------------------------------------

export const toggleButtonActiveStyles =
  "bg-[var(--color-border-focus)] border-[var(--color-border-focus)] text-white shadow-md";

export const toggleButtonInactiveStyles =
  "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]";
