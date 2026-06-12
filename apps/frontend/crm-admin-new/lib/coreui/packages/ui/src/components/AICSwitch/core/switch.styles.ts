/**
 * Switch style composition.
 * Combines base classes, size variants, state modifiers, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import {
  switchSizeStyles,
  thumbSizeStyles,
  thumbTranslateStyles,
} from "./switch.variants";
import type { SwitchSize } from "./switch.types";

// ---------------------------------------------------------------------------
// Style prop types
// ---------------------------------------------------------------------------

export interface GetSwitchTrackStylesProps {
  checked?: boolean;
  disabled?: boolean;
  size?: SwitchSize;
  className?: string;
}

export interface GetSwitchThumbStylesProps {
  checked?: boolean;
  size?: SwitchSize;
}

export interface GetSwitchWrapperStylesProps {
  labelPosition?: "left" | "right";
}

export interface GetSwitchLabelStylesProps {
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

const TRACK_BASE =
  "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

const THUMB_BASE =
  "rounded-full bg-white shadow-sm transition-transform pointer-events-none";

// ---------------------------------------------------------------------------
// getSwitchTrackStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Switch track.
 */
export function getSwitchTrackStyles(
  props: GetSwitchTrackStylesProps,
): string {
  const {
    checked = false,
    disabled = false,
    size = "md",
    className,
  } = props;

  return cn(
    TRACK_BASE,
    switchSizeStyles[size],
    checked
      ? "bg-[var(--color-primary)]"
      : "bg-[var(--color-border)]",
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );
}

// ---------------------------------------------------------------------------
// getSwitchThumbStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Switch thumb.
 */
export function getSwitchThumbStyles(
  props: GetSwitchThumbStylesProps,
): string {
  const { checked = false, size = "md" } = props;

  return cn(
    THUMB_BASE,
    thumbSizeStyles[size],
    checked ? thumbTranslateStyles[size] : "translate-x-0.5",
  );
}

// ---------------------------------------------------------------------------
// getSwitchWrapperStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the wrapper that contains the switch and label.
 * When `labelPosition` is `"left"`, the layout is reversed so the label
 * appears before the track.
 */
export function getSwitchWrapperStyles(
  props: GetSwitchWrapperStylesProps = {},
): string {
  const { labelPosition = "right" } = props;

  return cn(
    "inline-flex items-center gap-2",
    labelPosition === "left" && "flex-row-reverse",
  );
}

// ---------------------------------------------------------------------------
// getSwitchLabelStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the switch label text.
 */
export function getSwitchLabelStyles(
  props: GetSwitchLabelStylesProps = {},
): string {
  const { disabled = false } = props;

  return cn(
    "text-sm font-medium text-[var(--color-text)] select-none",
    disabled && "opacity-50",
  );
}

// ---------------------------------------------------------------------------
// getSwitchDescriptionStyles
// ---------------------------------------------------------------------------

/**
 * Returns class string for the switch description text.
 */
export function getSwitchDescriptionStyles(): string {
  return "text-xs text-[var(--color-text-secondary)]";
}
