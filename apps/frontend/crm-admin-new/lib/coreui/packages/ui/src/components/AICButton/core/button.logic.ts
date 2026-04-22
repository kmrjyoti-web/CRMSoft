/**
 * Button state reducer and state resolution logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed DOM events into the reducer via
 * dispatched actions and then call `resolveButtonState` to derive the
 * visual state used for styling.
 */

import type { ButtonState } from "./button.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the button reducer handles. */
export type ButtonAction =
  | { type: "PRESS" }
  | { type: "RELEASE" }
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "MOUSE_ENTER" }
  | { type: "MOUSE_LEAVE" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface ButtonInternalState {
  isPressed: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

/** Starting state — nothing is active. */
export const initialButtonState: ButtonInternalState = {
  isPressed: false,
  isFocused: false,
  isHovered: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for button interactions.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function buttonReducer(
  state: ButtonInternalState,
  action: ButtonAction,
): ButtonInternalState {
  switch (action.type) {
    case "PRESS":
      return { ...state, isPressed: true };
    case "RELEASE":
      return { ...state, isPressed: false };
    case "FOCUS":
      return { ...state, isFocused: true };
    case "BLUR":
      return { ...state, isFocused: false };
    case "MOUSE_ENTER":
      return { ...state, isHovered: true };
    case "MOUSE_LEAVE":
      return { ...state, isHovered: false, isPressed: false };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

/** Minimal props required to resolve the visual button state. */
export interface ResolveButtonStateProps {
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Derives the canonical `ButtonState` from component props and the internal
 * interaction state.  Priority order (highest first):
 *
 * 1. loading
 * 2. disabled
 * 3. active (pressed)
 * 4. focused
 * 5. hover
 * 6. default
 */
export function resolveButtonState(
  props: ResolveButtonStateProps,
  internalState: ButtonInternalState,
): ButtonState {
  if (props.loading) return "loading";
  if (props.disabled) return "disabled";
  if (internalState.isPressed) return "active";
  if (internalState.isFocused) return "focused";
  if (internalState.isHovered) return "hover";
  return "default";
}
