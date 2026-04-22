/**
 * Badge state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Badge is mostly stateless — the reducer handles the optional remove
 * interaction. Consumers dispatch REMOVE and the reducer sets
 * `isRemoved` to true.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the badge reducer handles. */
export type BadgeAction =
  | { type: "REMOVE" }
  | { type: "HOVER_ENTER" }
  | { type: "HOVER_LEAVE" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface BadgeInternalState {
  /** Whether the badge has been removed/dismissed. */
  isRemoved: boolean;
  /** Whether the badge is being hovered. */
  isHovered: boolean;
}

/** Starting state — visible and not hovered. */
export const initialBadgeState: BadgeInternalState = {
  isRemoved: false,
  isHovered: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for badge interactions.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function badgeReducer(
  state: BadgeInternalState,
  action: BadgeAction,
): BadgeInternalState {
  switch (action.type) {
    case "REMOVE":
      return { ...state, isRemoved: true };
    case "HOVER_ENTER":
      return { ...state, isHovered: true };
    case "HOVER_LEAVE":
      return { ...state, isHovered: false };
    default:
      return state;
  }
}
