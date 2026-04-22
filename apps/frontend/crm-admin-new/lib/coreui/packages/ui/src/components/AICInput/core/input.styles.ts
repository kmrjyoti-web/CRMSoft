/**
 * Input style composition.
 * Combines base classes, state modifiers, size, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { sizeStyles, stateStyles } from "./input.variants";
import type { InputSize, InputState } from "./input.types";

// ---------------------------------------------------------------------------
// Style props accepted by each composer
// ---------------------------------------------------------------------------

export interface GetInputStylesProps {
  size?: InputSize;
  state?: InputState;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Base classes shared by every input instance
// ---------------------------------------------------------------------------

const BASE_CLASSES =
  "flex w-full rounded-[var(--radius-md)] border bg-[var(--color-bg)] text-[var(--color-text)] transition-colors placeholder:text-[var(--color-text-tertiary)]";

// ---------------------------------------------------------------------------
// getInputStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Input element container.
 *
 * @param props - Subset of input props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getInputStyles(props: GetInputStylesProps): string {
  const {
    size = "md",
    state = "default",
    disabled = false,
    readOnly = false,
    error = false,
    className,
  } = props;

  // Determine the resolved visual state for styling
  let resolvedState: InputState = state;
  if (disabled) resolvedState = "disabled";
  else if (readOnly) resolvedState = "readOnly";
  else if (error) resolvedState = "error";

  return cn(
    BASE_CLASSES,
    stateStyles[resolvedState],
    sizeStyles[size],
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );
}

// ---------------------------------------------------------------------------
// getInputWrapperStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the outer wrapper container that holds
 * the input, error message, and character counter.
 */
export function getInputWrapperStyles(className?: string): string {
  return cn("flex flex-col gap-1 w-full", className);
}

// ---------------------------------------------------------------------------
// getInputErrorStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the error message text displayed below the input.
 */
export function getInputErrorStyles(): string {
  return "text-sm text-[var(--color-danger)]";
}
