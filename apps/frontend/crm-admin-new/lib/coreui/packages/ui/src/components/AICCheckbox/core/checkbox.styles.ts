/**
 * Checkbox style composition.
 * Combines base classes, state modifiers, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { checkboxStateStyles } from "./checkbox.variants";
import type { CheckboxState } from "./checkbox.types";

// ---------------------------------------------------------------------------
// Style prop types
// ---------------------------------------------------------------------------

export interface GetCheckboxStylesProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export interface GetCheckboxWrapperStylesProps {
  disabled?: boolean;
}

export interface GetCheckboxGroupStylesProps {
  orientation?: "horizontal" | "vertical";
}

export interface GetCheckboxLabelStylesProps {
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveVisualState(
  checked?: boolean,
  indeterminate?: boolean,
): CheckboxState {
  if (indeterminate) return "indeterminate";
  if (checked) return "checked";
  return "unchecked";
}

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

const CHECKBOX_BASE =
  "inline-flex items-center justify-center h-4 w-4 rounded-[var(--radius-sm)] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

// ---------------------------------------------------------------------------
// getCheckboxStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Checkbox indicator.
 */
export function getCheckboxStyles(props: GetCheckboxStylesProps): string {
  const {
    checked = false,
    indeterminate = false,
    disabled = false,
    error = false,
    className,
  } = props;

  const state = resolveVisualState(checked, indeterminate);

  return cn(
    CHECKBOX_BASE,
    checkboxStateStyles[state],
    disabled && "opacity-50 cursor-not-allowed",
    error && "border-[var(--color-danger)]",
    className,
  );
}

// ---------------------------------------------------------------------------
// getCheckboxWrapperStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the wrapper that contains the checkbox and label.
 */
export function getCheckboxWrapperStyles(
  props: GetCheckboxWrapperStylesProps = {},
): string {
  const { disabled = false } = props;

  return cn(
    "inline-flex items-start gap-2",
    disabled && "cursor-not-allowed",
  );
}

// ---------------------------------------------------------------------------
// getCheckboxGroupStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the checkbox group container.
 */
export function getCheckboxGroupStyles(
  props: GetCheckboxGroupStylesProps = {},
): string {
  const { orientation = "vertical" } = props;

  return cn(
    "flex",
    orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-2",
  );
}

// ---------------------------------------------------------------------------
// getCheckboxLabelStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the checkbox label text.
 */
export function getCheckboxLabelStyles(
  props: GetCheckboxLabelStylesProps = {},
): string {
  const { disabled = false } = props;

  return cn(
    "text-sm font-medium text-[var(--color-text)] select-none",
    disabled && "opacity-50",
  );
}

// ---------------------------------------------------------------------------
// getCheckboxDescriptionStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the checkbox description text.
 */
export function getCheckboxDescriptionStyles(): string {
  return "text-xs text-[var(--color-text-secondary)]";
}
