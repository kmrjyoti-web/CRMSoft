/**
 * Modal state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed interaction events into the reducer
 * via dispatched actions and read the derived `isOpen` state.
 */

import type { ModalMode } from "./modal.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the modal reducer handles. */
export type ModalAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ESCAPE" }
  | { type: "OVERLAY_CLICK" };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Configuration that affects reducer behaviour. */
export interface ModalReducerConfig {
  closeOnOverlay: boolean;
  closeOnEscape: boolean;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface ModalInternalState {
  isOpen: boolean;
}

/** Starting state — modal is closed. */
export const initialModalState: ModalInternalState = {
  isOpen: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for modal interactions.
 *
 * The reducer checks the provided config before responding to ESCAPE
 * and OVERLAY_CLICK actions, allowing consumers to configure which
 * close behaviours are enabled.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @param config - Configuration affecting close behaviour.
 * @returns Updated internal state.
 */
export function modalReducer(
  state: ModalInternalState,
  action: ModalAction,
  config: ModalReducerConfig,
): ModalInternalState {
  switch (action.type) {
    case "OPEN":
      return { isOpen: true };

    case "CLOSE":
      return { isOpen: false };

    case "ESCAPE":
      if (config.closeOnEscape) {
        return { isOpen: false };
      }
      return state;

    case "OVERLAY_CLICK":
      if (config.closeOnOverlay) {
        return { isOpen: false };
      }
      return state;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Mode resolver
// ---------------------------------------------------------------------------

/** Layout hints used to automatically select a modal mode. */
export interface ModalLayoutHints {
  hasSidebar?: boolean;
  isMobile?: boolean;
}

/**
 * Resolves the modal mode to use.
 *
 * If an explicit mode is provided, it is used directly.
 * Otherwise, layout hints are used to infer an appropriate mode:
 * - Mobile devices default to "top-dropdown" for bottom-sheet-like UX.
 * - Desktop with sidebar context defaults to "slide-panel".
 * - Everything else defaults to "center".
 *
 * @param explicitMode - An explicitly provided mode, if any.
 * @param layoutHints  - Optional layout context hints.
 * @returns The resolved ModalMode.
 */
export function resolveModalMode(
  explicitMode?: ModalMode,
  layoutHints?: ModalLayoutHints,
): ModalMode {
  if (explicitMode) {
    return explicitMode;
  }

  if (layoutHints?.isMobile) {
    return "top-dropdown";
  }

  if (layoutHints?.hasSidebar) {
    return "slide-panel";
  }

  return "center";
}
