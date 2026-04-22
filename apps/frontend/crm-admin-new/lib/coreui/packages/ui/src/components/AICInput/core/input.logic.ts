/**
 * Input state reducer and state resolution logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed DOM events into the reducer via
 * dispatched actions and then call `resolveInputState` to derive the
 * visual state used for styling.
 */

import type { InputState } from "./input.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the input reducer handles. */
export type InputAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "CHANGE"; value: string }
  | { type: "CLEAR" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface InputInternalState {
  isFocused: boolean;
  value: string;
}

/** Starting state — empty and unfocused. */
export const initialInputState: InputInternalState = {
  isFocused: false,
  value: "",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for input interactions.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function inputReducer(
  state: InputInternalState,
  action: InputAction,
): InputInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true };
    case "BLUR":
      return { ...state, isFocused: false };
    case "CHANGE":
      return { ...state, value: action.value };
    case "CLEAR":
      return { ...state, value: "" };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

/** Minimal props required to resolve the visual input state. */
export interface ResolveInputStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

/**
 * Derives the canonical `InputState` from component props and the internal
 * interaction state.  Priority order (highest first):
 *
 * 1. disabled
 * 2. readOnly
 * 3. error
 * 4. focused
 * 5. default
 */
export function resolveInputState(
  props: ResolveInputStateProps,
  internalState: InputInternalState,
): InputState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Helper: should show clear button?
// ---------------------------------------------------------------------------

/** Minimal props required to determine clear button visibility. */
export interface ShouldShowClearProps {
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Determines whether the clear button should be visible.
 * The clear button is shown only when:
 * - `clearable` is true
 * - the current value is not empty
 * - the input is not disabled or read-only
 */
export function shouldShowClear(
  props: ShouldShowClearProps,
  internalState: InputInternalState,
): boolean {
  return (
    Boolean(props.clearable) &&
    internalState.value.length > 0 &&
    !props.disabled &&
    !props.readOnly
  );
}
