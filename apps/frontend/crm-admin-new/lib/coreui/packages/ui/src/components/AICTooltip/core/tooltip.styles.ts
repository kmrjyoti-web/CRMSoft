/**
 * Tooltip style composition.
 * Combines base classes, arrow positioning, and custom className
 * into Tailwind class strings.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { arrowPositionStyles, arrowDirectionStyles } from "./tooltip.variants";
import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Style props
// ---------------------------------------------------------------------------

export interface GetTooltipStylesProps {
  maxWidth?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

const TOOLTIP_BASE_CLASSES =
  "bg-[var(--color-bg-tooltip)] text-[var(--color-text-tooltip)] text-xs font-medium rounded-[var(--radius-sm)] px-2.5 py-1.5 shadow-[var(--shadow-md)] z-50 pointer-events-none";

const ARROW_BASE_CLASSES = "absolute w-0 h-0 border-4 border-solid";

// ---------------------------------------------------------------------------
// getTooltipStyles
// ---------------------------------------------------------------------------

/**
 * Returns a merged class string for the Tooltip content container.
 *
 * @param props - Subset of tooltip props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getTooltipStyles(props: GetTooltipStylesProps = {}): string {
  const { className } = props;

  return cn(TOOLTIP_BASE_CLASSES, className);
}

/**
 * Returns an inline style object for the tooltip, primarily for maxWidth.
 *
 * @param maxWidth - Maximum width in pixels.
 * @returns Inline style record.
 */
export function getTooltipInlineStyles(maxWidth: number = 250): Record<string, string> {
  return {
    maxWidth: `${maxWidth}px`,
  };
}

// ---------------------------------------------------------------------------
// getTooltipArrowStyles
// ---------------------------------------------------------------------------

/**
 * Extracts the base direction from a full Placement value.
 * e.g. "top-start" → "top", "bottom-end" → "bottom"
 */
function getBaseDirection(placement: Placement): string {
  return placement.split("-")[0];
}

/**
 * Returns a merged class string for the Tooltip arrow element.
 *
 * The arrow is a zero-width/height element using CSS border tricks
 * to create a triangle that points toward the trigger element.
 *
 * @param placement - The resolved placement of the tooltip.
 * @returns Merged Tailwind class string for the arrow.
 */
export function getTooltipArrowStyles(placement: Placement): string {
  const direction = getBaseDirection(placement);
  const positionClasses = arrowPositionStyles[placement] ?? arrowPositionStyles["top"];
  const directionClasses = arrowDirectionStyles[direction] ?? arrowDirectionStyles["top"];

  return cn(ARROW_BASE_CLASSES, positionClasses, directionClasses);
}
