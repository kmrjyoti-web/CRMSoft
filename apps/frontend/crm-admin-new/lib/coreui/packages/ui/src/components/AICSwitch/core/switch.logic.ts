/**
 * Switch state reducer logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed user interactions into the reducer
 * via dispatched actions.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the switch reducer handles. */
export type SwitchAction =
  | { type: "TOGGLE" }
  | { type: "SET"; checked: boolean };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for switch checked state.
 *
 * @param state  - Current checked state.
 * @param action - The interaction that occurred.
 * @returns Updated checked state.
 */
export function switchReducer(
  state: boolean,
  action: SwitchAction,
): boolean {
  switch (action.type) {
    case "TOGGLE":
      return !state;
    case "SET":
      return action.checked;
    default:
      return state;
  }
}
