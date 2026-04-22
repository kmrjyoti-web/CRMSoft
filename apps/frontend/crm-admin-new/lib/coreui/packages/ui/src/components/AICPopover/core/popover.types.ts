/**
 * Popover component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

import type { Placement } from "../../../utils/position";

// ---------------------------------------------------------------------------
// Trigger type
// ---------------------------------------------------------------------------

/** How the popover is activated. */
export type PopoverTrigger = "click" | "hover" | "focus" | "manual";

// ---------------------------------------------------------------------------
// PopoverProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Popover component.
 *
 * `OnOpenChange` is purposely generic so each framework adapter can supply
 * its own callback signature.
 */
export interface PopoverProps<OnOpenChange = (open: boolean) => void> {
  /** Activation method for showing the popover. */
  trigger?: PopoverTrigger;
  /** Preferred placement relative to the trigger element. */
  placement?: Placement;
  /** Whether to show an arrow pointing to the trigger. */
  arrow?: boolean;
  /** Offset distance from the trigger in pixels. */
  offset?: number;
  /** Whether clicking outside the popover closes it. */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the popover. */
  closeOnEscape?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Unique identifier for the popover element. */
  id?: string;
  /** Callback invoked when the popover open state changes. */
  onOpenChange?: OnOpenChange;
}
