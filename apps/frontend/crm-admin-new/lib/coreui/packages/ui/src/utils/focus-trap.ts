/**
 * Focus trap utilities.
 * Framework-agnostic — no DOM types.
 *
 * Provides a pure reducer for managing focus trap state and intent,
 * plus keyboard-to-action mappings. Framework adapters execute the
 * actual DOM focus operations based on the `focusIntent` output.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for focus trap behaviour. */
export interface FocusTrapConfig {
  /** Whether focus should wrap from last to first (and vice versa). */
  wrapAround: boolean;
  /** Whether pressing Escape should deactivate the trap. */
  closeOnEscape: boolean;
  /** Whether clicking outside the container should deactivate the trap. */
  closeOnClickOutside: boolean;
  /** Whether to auto-focus the first focusable element on activation. */
  autoFocus: boolean;
  /** Whether to restore focus to the previously focused element on deactivation. */
  restoreFocus: boolean;
}

/** Zod schema for focus trap configuration with defaults. */
export const focusTrapConfigSchema = z.object({
  wrapAround: z.boolean().default(true),
  closeOnEscape: z.boolean().default(true),
  closeOnClickOutside: z.boolean().default(true),
  autoFocus: z.boolean().default(true),
  restoreFocus: z.boolean().default(true),
});

/**
 * Resolves a partial focus trap config into a fully defaulted config.
 *
 * @param config - Partial focus trap configuration.
 * @returns Fully resolved configuration.
 */
export function resolveFocusTrapConfig(
  config?: Partial<FocusTrapConfig>,
): FocusTrapConfig {
  return focusTrapConfigSchema.parse(config ?? {}) as FocusTrapConfig;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the focus trap reducer handles. */
export type FocusTrapAction =
  | { type: "ACTIVATE" }
  | { type: "DEACTIVATE" }
  | { type: "TAB_FORWARD"; isLastElement: boolean }
  | { type: "TAB_BACKWARD"; isFirstElement: boolean }
  | { type: "ESCAPE" }
  | { type: "CLICK_OUTSIDE" }
  | { type: "FOCUS_INTENT_HANDLED" };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/**
 * Focus intent values that framework adapters use to determine which DOM
 * element to focus. The adapter reads the intent, performs the focus, then
 * dispatches `FOCUS_INTENT_HANDLED` to clear it.
 */
export type FocusIntent =
  | "none"
  | "first"
  | "last"
  | "wrap-to-first"
  | "wrap-to-last"
  | "restore";

/** Internal state of the focus trap. */
export interface FocusTrapState {
  /** Whether the focus trap is currently active. */
  isActive: boolean;
  /** The intent describing which element should receive focus next. */
  focusIntent: FocusIntent;
}

/** Initial state — inactive, no focus intent. */
export const initialFocusTrapState: FocusTrapState = {
  isActive: false,
  focusIntent: "none",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for focus trap interactions.
 *
 * The reducer itself never touches the DOM. It produces `focusIntent` values
 * that framework adapters interpret to execute actual focus changes.
 *
 * @param state  - Current focus trap state.
 * @param action - The interaction that occurred.
 * @param config - Resolved focus trap configuration.
 * @returns Updated focus trap state.
 */
export function focusTrapReducer(
  state: FocusTrapState,
  action: FocusTrapAction,
  config: FocusTrapConfig,
): FocusTrapState {
  switch (action.type) {
    case "ACTIVATE":
      return {
        isActive: true,
        focusIntent: config.autoFocus ? "first" : "none",
      };

    case "DEACTIVATE":
      return {
        isActive: false,
        focusIntent: config.restoreFocus ? "restore" : "none",
      };

    case "TAB_FORWARD":
      if (!state.isActive) return state;
      if (action.isLastElement && config.wrapAround) {
        return { ...state, focusIntent: "wrap-to-first" };
      }
      // Let the browser handle natural tab order
      return state;

    case "TAB_BACKWARD":
      if (!state.isActive) return state;
      if (action.isFirstElement && config.wrapAround) {
        return { ...state, focusIntent: "wrap-to-last" };
      }
      // Let the browser handle natural tab order
      return state;

    case "ESCAPE":
      if (!state.isActive) return state;
      if (config.closeOnEscape) {
        return {
          isActive: false,
          focusIntent: config.restoreFocus ? "restore" : "none",
        };
      }
      return state;

    case "CLICK_OUTSIDE":
      if (!state.isActive) return state;
      if (config.closeOnClickOutside) {
        return {
          isActive: false,
          focusIntent: config.restoreFocus ? "restore" : "none",
        };
      }
      return state;

    case "FOCUS_INTENT_HANDLED":
      return { ...state, focusIntent: "none" };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `FocusTrapAction` type
 * that should be dispatched.
 *
 * Note: The TAB actions need additional context (isFirstElement / isLastElement)
 * which the framework adapter must supply. This map only provides the base
 * action type string.
 */
export function getFocusTrapKeyboardHandlers(): Record<string, FocusTrapAction["type"]> {
  return {
    Tab: "TAB_FORWARD",
    Escape: "ESCAPE",
  };
}
