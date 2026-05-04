/**
 * Tooltip state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed interaction events into the reducer
 * via dispatched actions and read the derived `isOpen` state.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the tooltip reducer handles. */
export type TooltipAction =
  | { type: "MOUSE_ENTER" }
  | { type: "MOUSE_LEAVE" }
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "OPEN" }
  | { type: "CLOSE" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** How the tooltip was opened — used to decide when it should close. */
export type TooltipOpenedVia = "hover" | "focus" | "manual" | null;

/** Internal interaction state tracked by the reducer. */
export interface TooltipInternalState {
  isOpen: boolean;
  openedVia: TooltipOpenedVia;
}

/** Starting state — tooltip is closed. */
export const initialTooltipState: TooltipInternalState = {
  isOpen: false,
  openedVia: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for tooltip interactions.
 *
 * The reducer tracks how the tooltip was opened so it can correctly
 * handle cases where hover and focus overlap:
 *
 * - If opened via hover, a MOUSE_LEAVE closes it (but not BLUR).
 * - If opened via focus, a BLUR closes it (but not MOUSE_LEAVE).
 * - If opened via both, it stays open until both conditions end.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function tooltipReducer(
  state: TooltipInternalState,
  action: TooltipAction,
): TooltipInternalState {
  switch (action.type) {
    case "MOUSE_ENTER":
      return {
        isOpen: true,
        openedVia: state.openedVia === "focus" ? "focus" : "hover",
      };

    case "MOUSE_LEAVE":
      // If the tooltip was opened via focus, keep it open
      if (state.openedVia === "focus") {
        return state;
      }
      return {
        isOpen: false,
        openedVia: null,
      };

    case "FOCUS":
      return {
        isOpen: true,
        openedVia: state.openedVia === "hover" ? "hover" : "focus",
      };

    case "BLUR":
      // If the tooltip was opened via hover, keep it open
      if (state.openedVia === "hover") {
        return state;
      }
      return {
        isOpen: false,
        openedVia: null,
      };

    case "OPEN":
      return {
        isOpen: true,
        openedVia: "manual",
      };

    case "CLOSE":
      return {
        isOpen: false,
        openedVia: null,
      };

    default:
      return state;
  }
}
