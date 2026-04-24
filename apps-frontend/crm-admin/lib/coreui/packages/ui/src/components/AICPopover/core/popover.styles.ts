/**
 * Popover style composition.
 * Combines base classes, arrow positioning, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import {
  popoverArrowPositionStyles,
  popoverArrowDirectionStyles,
} from "./popover.variants";
import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Style props
// ---------------------------------------------------------------------------

export interface GetPopoverContentStylesProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

const POPOVER_CONTENT_BASE_CLASSES =
  "bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-4 z-50";

const ARROW_BASE_CLASSES = "absolute w-0 h-0 border-[6px] border-solid";

// ---------------------------------------------------------------------------
// getPopoverContentStyles
// ---------------------------------------------------------------------------

/**
 * Returns a merged class string for the Popover content container.
 *
 * @param props - Subset of popover props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getPopoverContentStyles(
  props: GetPopoverContentStylesProps = {},
): string {
  const { className } = props;

  return cn(POPOVER_CONTENT_BASE_CLASSES, className);
}

// ---------------------------------------------------------------------------
// getPopoverArrowStyles
// ---------------------------------------------------------------------------

/**
 * Extracts the base direction from a full Placement value.
 * e.g. "top-start" -> "top", "bottom-end" -> "bottom"
 */
function getBaseDirection(placement: Placement): string {
  return placement.split("-")[0];
}

/**
 * Returns a merged class string for the Popover arrow element.
 *
 * The arrow is a zero-width/height element using CSS border tricks
 * to create a triangle that points toward the trigger element.
 *
 * @param placement - The resolved placement of the popover.
 * @returns Merged Tailwind class string for the arrow.
 */
export function getPopoverArrowStyles(placement: Placement): string {
  const direction = getBaseDirection(placement);
  const positionClasses =
    popoverArrowPositionStyles[placement] ??
    popoverArrowPositionStyles["top"];
  const directionClasses =
    popoverArrowDirectionStyles[direction] ??
    popoverArrowDirectionStyles["top"];

  return cn(ARROW_BASE_CLASSES, positionClasses, directionClasses);
}
