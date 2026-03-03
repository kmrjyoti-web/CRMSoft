/**
 * Popover state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed interaction events into the reducer
 * via dispatched actions and read the derived `isOpen` state.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the popover reducer handles. */
export type PopoverAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE" }
  | { type: "CLICK_OUTSIDE" };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Configuration that affects reducer behaviour. */
export interface PopoverReducerConfig {
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface PopoverInternalState {
  isOpen: boolean;
}

/** Starting state — popover is closed. */
export const initialPopoverState: PopoverInternalState = {
  isOpen: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for popover interactions.
 *
 * The reducer checks the provided config before responding to ESCAPE
 * and CLICK_OUTSIDE actions, allowing consumers to configure which
 * close behaviours are enabled.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @param config - Configuration affecting close behaviour.
 * @returns Updated internal state.
 */
export function popoverReducer(
  state: PopoverInternalState,
  action: PopoverAction,
  config: PopoverReducerConfig,
): PopoverInternalState {
  switch (action.type) {
    case "OPEN":
      return { isOpen: true };

    case "CLOSE":
      return { isOpen: false };

    case "TOGGLE":
      return { isOpen: !state.isOpen };

    case "ESCAPE":
      if (config.closeOnEscape) {
        return { isOpen: false };
      }
      return state;

    case "CLICK_OUTSIDE":
      if (config.closeOnOutsideClick) {
        return { isOpen: false };
      }
      return state;

    default:
      return state;
  }
}
