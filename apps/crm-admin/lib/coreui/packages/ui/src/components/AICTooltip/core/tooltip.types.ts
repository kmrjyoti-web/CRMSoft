/**
 * Tooltip component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Trigger type
// ---------------------------------------------------------------------------

/** How the tooltip is activated. */
export type TooltipTrigger = "hover" | "focus" | "both";

// ---------------------------------------------------------------------------
// TooltipProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Tooltip component.
 *
 * `OnOpenChange` is purposely generic so each framework adapter can supply
 * its own callback signature.
 */
export interface TooltipProps<OnOpenChange = (open: boolean) => void> {
  /** Text content displayed inside the tooltip. */
  content: string;
  /** Preferred placement relative to the trigger element. */
  placement?: Placement;
  /** Activation method for showing the tooltip. */
  trigger?: TooltipTrigger;
  /** Delay in milliseconds before the tooltip appears. */
  delay?: number;
  /** Maximum width of the tooltip in pixels. */
  maxWidth?: number;
  /** Additional CSS class name(s). */
  className?: string;
  /** Unique identifier for the tooltip element. */
  id?: string;
  /** Callback invoked when the tooltip open state changes. */
  onOpenChange?: OnOpenChange;
}
