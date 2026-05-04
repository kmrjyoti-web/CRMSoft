/**
 * Drawer state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed user interactions into the reducer
 * via dispatched actions to manage the drawer's open/close state.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the drawer reducer handles. */
export type DrawerAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ESCAPE" }
  | { type: "OVERLAY_CLICK" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal state tracked by the drawer reducer. */
export interface DrawerInternalState {
  /** Whether the drawer is currently open. */
  isOpen: boolean;
}

/** Starting state — drawer is closed. */
export const initialDrawerState: DrawerInternalState = {
  isOpen: false,
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Configuration that influences how the reducer responds to actions. */
export interface DrawerReducerConfig {
  /** Whether clicking the overlay should close the drawer. */
  closeOnOverlay: boolean;
  /** Whether pressing Escape should close the drawer. */
  closeOnEscape: boolean;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for drawer interactions.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @param config - Configuration that affects reducer behaviour.
 * @returns Updated internal state.
 */
export function drawerReducer(
  state: DrawerInternalState,
  action: DrawerAction,
  config: DrawerReducerConfig,
): DrawerInternalState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true };

    case "CLOSE":
      return { ...state, isOpen: false };

    case "ESCAPE":
      if (config.closeOnEscape) {
        return { ...state, isOpen: false };
      }
      return state;

    case "OVERLAY_CLICK":
      if (config.closeOnOverlay) {
        return { ...state, isOpen: false };
      }
      return state;

    default:
      return state;
  }
}
