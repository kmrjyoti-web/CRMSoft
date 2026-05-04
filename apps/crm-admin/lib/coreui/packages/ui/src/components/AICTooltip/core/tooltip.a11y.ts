/**
 * Tooltip accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects that framework adapters can spread
 * onto DOM elements.
 */

// ---------------------------------------------------------------------------
// Tooltip element ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getTooltipA11yProps`. */
export interface TooltipA11yInput {
  id: string;
}

/** Shape of the object returned by `getTooltipA11yProps`. */
export interface TooltipA11yProps {
  role: string;
  id: string;
}

/**
 * Computes the ARIA attributes for the Tooltip element itself.
 *
 * The tooltip element receives `role="tooltip"` and a unique `id`
 * that the trigger element references via `aria-describedby`.
 */
export function getTooltipA11yProps(input: TooltipA11yInput): TooltipA11yProps {
  return {
    role: "tooltip",
    id: input.id,
  };
}

// ---------------------------------------------------------------------------
// Trigger element ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getTooltipTriggerA11yProps`. */
export interface TooltipTriggerA11yInput {
  id: string;
  isOpen: boolean;
}

/** Shape of the object returned by `getTooltipTriggerA11yProps`. */
export interface TooltipTriggerA11yProps {
  "aria-describedby"?: string;
}

/**
 * Computes the ARIA attributes for the tooltip trigger element.
 *
 * When the tooltip is open, `aria-describedby` is set to the tooltip's
 * `id` so assistive technologies announce the tooltip content. When
 * closed, the attribute is omitted.
 */
export function getTooltipTriggerA11yProps(
  input: TooltipTriggerA11yInput,
): TooltipTriggerA11yProps {
  const props: TooltipTriggerA11yProps = {};

  if (input.isOpen) {
    props["aria-describedby"] = input.id;
  }

  return props;
}
