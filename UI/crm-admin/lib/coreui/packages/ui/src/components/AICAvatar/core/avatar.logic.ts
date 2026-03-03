/**
 * Avatar state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Manages the image loading lifecycle: loading -> loaded | error.
 * On error, the component shows fallback initials.
 */

import type { AvatarImageState } from "./avatar.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the avatar reducer handles. */
export type AvatarAction =
  | { type: "IMAGE_LOAD" }
  | { type: "IMAGE_ERROR" }
  | { type: "IMAGE_RESET" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal state tracked by the reducer. */
export interface AvatarInternalState {
  /** Current state of the avatar image. */
  imageState: AvatarImageState;
}

/** Starting state — image is loading. */
export const initialAvatarState: AvatarInternalState = {
  imageState: "loading",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for avatar image lifecycle.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function avatarReducer(
  state: AvatarInternalState,
  action: AvatarAction,
): AvatarInternalState {
  switch (action.type) {
    case "IMAGE_LOAD":
      return { ...state, imageState: "loaded" };
    case "IMAGE_ERROR":
      return { ...state, imageState: "error" };
    case "IMAGE_RESET":
      return { ...state, imageState: "loading" };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines whether the fallback should be shown based on image state
 * and whether a src is provided.
 *
 * @param imageState - Current image loading state.
 * @param src        - Image source URL.
 * @returns True if the fallback should be displayed.
 */
export function shouldShowFallback(
  imageState: AvatarImageState,
  src?: string,
): boolean {
  if (!src) return true;
  return imageState === "error";
}
