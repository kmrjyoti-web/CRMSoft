/**
 * Select style composition.
 * Combines base classes, state modifiers, size, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { sizeStyles, stateStyles, dropdownStyles } from "./select.variants";
import type { SelectSize, SelectState, SelectOption } from "./select.types";

// ---------------------------------------------------------------------------
// Trigger style props
// ---------------------------------------------------------------------------

export interface GetSelectTriggerStylesProps {
  size?: SelectSize;
  state?: SelectState;
  disabled?: boolean;
  error?: boolean;
  isOpen?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Trigger base classes
// ---------------------------------------------------------------------------

const TRIGGER_BASE =
  "flex w-full items-center justify-between rounded-[var(--radius-md)] border bg-[var(--color-bg)] text-[var(--color-text)] transition-colors cursor-pointer select-none";

// ---------------------------------------------------------------------------
// getSelectTriggerStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Select trigger button.
 *
 * @param props - Subset of select props that influence trigger styling.
 * @returns Merged Tailwind class string.
 */
export function getSelectTriggerStyles(props: GetSelectTriggerStylesProps): string {
  const {
    size = "md",
    state = "default",
    disabled = false,
    error = false,
    isOpen = false,
    className,
  } = props;

  let resolvedState: SelectState = state;
  if (disabled) resolvedState = "disabled";
  else if (error) resolvedState = "error";
  else if (isOpen) resolvedState = "open";

  return cn(
    TRIGGER_BASE,
    stateStyles[resolvedState],
    sizeStyles[size],
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );
}

// ---------------------------------------------------------------------------
// Dropdown style props
// ---------------------------------------------------------------------------

export interface GetSelectDropdownStylesProps {
  maxHeight?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// getSelectDropdownStyles
// ---------------------------------------------------------------------------

/**
 * Returns a merged class string for the Select dropdown panel.
 *
 * @param props - Dropdown styling options.
 * @returns Merged Tailwind class string.
 */
export function getSelectDropdownStyles(props?: GetSelectDropdownStylesProps): string {
  const { className } = props ?? {};

  return cn(
    dropdownStyles,
    className,
  );
}

// ---------------------------------------------------------------------------
// getSelectOptionStyles
// ---------------------------------------------------------------------------

/**
 * Returns a merged class string for a single Select option item.
 *
 * @param option      - The option object (used to check disabled state).
 * @param isSelected  - Whether this option is currently selected.
 * @param isHighlighted - Whether this option is keyboard-highlighted.
 * @returns Merged Tailwind class string.
 */
export function getSelectOptionStyles(
  option: SelectOption,
  isSelected: boolean,
  isHighlighted: boolean,
): string {
  return cn(
    "flex items-center w-full px-3 py-2 text-sm transition-colors cursor-pointer",
    // Highlighted (keyboard focus)
    isHighlighted && !option.disabled &&
      "bg-[var(--color-bg-secondary)]",
    // Selected
    isSelected && !option.disabled &&
      "text-[var(--color-primary)] font-medium",
    // Selected + highlighted
    isSelected && isHighlighted && !option.disabled &&
      "bg-[var(--color-bg-secondary)]",
    // Disabled
    option.disabled &&
      "opacity-50 cursor-not-allowed text-[var(--color-text-tertiary)]",
    // Default (not highlighted, not selected, not disabled)
    !isHighlighted && !isSelected && !option.disabled &&
      "text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]",
  );
}

// ---------------------------------------------------------------------------
// getSelectTagStyles
// ---------------------------------------------------------------------------

/**
 * Returns a class string for multi-select tag / chip elements.
 */
export function getSelectTagStyles(): string {
  return cn(
    "inline-flex items-center gap-1 max-w-[120px] rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs",
    "bg-[var(--color-bg-secondary)] text-[var(--color-text)]",
    "border border-[var(--color-border)]",
  );
}

// ---------------------------------------------------------------------------
// Error message styles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the error message text displayed below the select.
 */
export function getSelectErrorStyles(): string {
  return "text-sm text-[var(--color-danger)]";
}

// ---------------------------------------------------------------------------
// Wrapper styles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the outer wrapper container.
 */
export function getSelectWrapperStyles(className?: string): string {
  return cn("relative flex flex-col gap-1 w-full", className);
}
