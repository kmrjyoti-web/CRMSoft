/**
 * Checkbox state reducer and state resolution logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed user interactions into the reducer
 * via dispatched actions.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the checkbox reducer handles. */
export type CheckboxAction =
  | { type: "TOGGLE" }
  | { type: "SET"; checked: boolean };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for checkbox checked state.
 *
 * @param state  - Current checked state.
 * @param action - The interaction that occurred.
 * @returns Updated checked state.
 */
export function checkboxReducer(
  state: boolean,
  action: CheckboxAction,
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

// ---------------------------------------------------------------------------
// Visual state resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the visual state name from the component props.
 *
 * @param checked       - Whether the checkbox is checked.
 * @param indeterminate - Whether the checkbox is in mixed state.
 * @param disabled      - Whether the checkbox is disabled.
 * @returns A string describing the visual state for styling.
 */
export function resolveCheckboxVisualState(
  checked: boolean,
  indeterminate: boolean,
  _disabled: boolean,
): string {
  if (indeterminate) return "indeterminate";
  if (checked) return "checked";
  return "unchecked";
}
