/**
 * Radio state reducer logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed user interactions into the reducer
 * via dispatched actions.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the radio group reducer handles. */
export type RadioAction = { type: "SELECT"; value: string };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for radio group selection.
 *
 * Simply returns the newly selected value — radio groups are single-select
 * by nature.
 *
 * @param _state - Current selected value.
 * @param action - The interaction that occurred.
 * @returns Updated selected value.
 */
export function radioGroupReducer(
  _state: string,
  action: RadioAction,
): string {
  switch (action.type) {
    case "SELECT":
      return action.value;
    default:
      return _state;
  }
}
