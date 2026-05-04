/**
 * Radio style composition.
 * Combines base classes, state modifiers, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { radioStateStyles } from "./radio.variants";

// ---------------------------------------------------------------------------
// Style prop types
// ---------------------------------------------------------------------------

export interface GetRadioStylesProps {
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface GetRadioWrapperStylesProps {
  disabled?: boolean;
}

export interface GetRadioLabelStylesProps {
  disabled?: boolean;
}

export interface GetRadioGroupStylesProps {
  orientation?: "horizontal" | "vertical";
}

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

const RADIO_BASE =
  "inline-flex items-center justify-center h-4 w-4 rounded-full border-2 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

// ---------------------------------------------------------------------------
// getRadioStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Radio indicator.
 */
export function getRadioStyles(props: GetRadioStylesProps): string {
  const {
    checked = false,
    disabled = false,
    className,
  } = props;

  const state = checked ? "checked" : "unchecked";

  return cn(
    RADIO_BASE,
    radioStateStyles[state],
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );
}

// ---------------------------------------------------------------------------
// getRadioWrapperStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the wrapper that contains the radio and label.
 */
export function getRadioWrapperStyles(
  props: GetRadioWrapperStylesProps = {},
): string {
  const { disabled = false } = props;

  return cn(
    "inline-flex items-start gap-2",
    disabled && "cursor-not-allowed",
  );
}

// ---------------------------------------------------------------------------
// getRadioLabelStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the radio label text.
 */
export function getRadioLabelStyles(
  props: GetRadioLabelStylesProps = {},
): string {
  const { disabled = false } = props;

  return cn(
    "text-sm font-medium text-[var(--color-text)] select-none",
    disabled && "opacity-50",
  );
}

// ---------------------------------------------------------------------------
// getRadioDescriptionStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the radio description text.
 */
export function getRadioDescriptionStyles(): string {
  return "text-xs text-[var(--color-text-secondary)]";
}

// ---------------------------------------------------------------------------
// getRadioGroupStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the radio group container.
 */
export function getRadioGroupStyles(
  props: GetRadioGroupStylesProps = {},
): string {
  const { orientation = "vertical" } = props;

  return cn(
    "flex",
    orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-2",
  );
}
