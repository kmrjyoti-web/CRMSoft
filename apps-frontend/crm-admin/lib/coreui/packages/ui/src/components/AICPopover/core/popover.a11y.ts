/**
 * Popover accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects that framework adapters can spread
 * onto DOM elements.
 */

// ---------------------------------------------------------------------------
// Popover element ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getPopoverA11yProps`. */
export interface PopoverA11yInput {
  id: string;
}

/** Shape of the object returned by `getPopoverA11yProps`. */
export interface PopoverA11yProps {
  role: string;
  "aria-modal": boolean;
  id: string;
}

/**
 * Computes the ARIA attributes for the Popover content element.
 *
 * The popover receives `role="dialog"` and `aria-modal=false` since
 * popovers are non-modal dialogs — the user can still interact with
 * the rest of the page.
 */
export function getPopoverA11yProps(input: PopoverA11yInput): PopoverA11yProps {
  return {
    role: "dialog",
    "aria-modal": false,
    id: input.id,
  };
}

// ---------------------------------------------------------------------------
// Trigger element ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getPopoverTriggerA11yProps`. */
export interface PopoverTriggerA11yInput {
  id: string;
  isOpen: boolean;
}

/** Shape of the object returned by `getPopoverTriggerA11yProps`. */
export interface PopoverTriggerA11yProps {
  "aria-haspopup": string;
  "aria-expanded": boolean;
  "aria-controls"?: string;
}

/**
 * Computes the ARIA attributes for the popover trigger element.
 *
 * - `aria-haspopup` is always `"dialog"` to indicate a dialog can appear.
 * - `aria-expanded` reflects the current open state.
 * - `aria-controls` references the popover's `id` when open.
 */
export function getPopoverTriggerA11yProps(
  input: PopoverTriggerA11yInput,
): PopoverTriggerA11yProps {
  const props: PopoverTriggerA11yProps = {
    "aria-haspopup": "dialog",
    "aria-expanded": input.isOpen,
  };

  if (input.isOpen) {
    props["aria-controls"] = input.id;
  }

  return props;
}
