/**
 * Framework-agnostic pub/sub store for toast notifications.
 * No DOM types — pure ES2020.
 *
 * Framework adapters subscribe to state changes and render accordingly.
 * The store manages state via the toast reducer and notifies listeners
 * on every dispatch.
 */

import { toastReducer, initialToastState } from "./toast.logic";
import type { ToastAction, ToastInternalState } from "./toast.logic";
import type { ToastConfig } from "./toast.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Callback invoked whenever the store state changes. */
export type ToastStoreListener = (state: ToastInternalState) => void;

/** Public API of a toast store instance. */
export interface ToastStore {
  /** Returns the current state snapshot. */
  getState: () => ToastInternalState;
  /** Dispatches an action to update state and notify listeners. */
  dispatch: (action: ToastAction) => void;
  /** Subscribes a listener. Returns an unsubscribe function. */
  subscribe: (listener: ToastStoreListener) => () => void;
  /** The configuration this store was created with. */
  config: Required<ToastConfig>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new toast store instance.
 *
 * The store is fully self-contained: it holds its own state, runs the
 * reducer on dispatch, and notifies all subscribed listeners.
 *
 * @param config - Optional toast system configuration.
 * @returns A `ToastStore` instance.
 */
export function createToastStore(config?: ToastConfig): ToastStore {
  const resolvedConfig: Required<ToastConfig> = {
    position: config?.position ?? "top-right",
    maxVisible: config?.maxVisible ?? 5,
    defaultDuration: config?.defaultDuration ?? 5000,
  };

  let state: ToastInternalState = { ...initialToastState };
  const listeners = new Set<ToastStoreListener>();

  function getState(): ToastInternalState {
    return state;
  }

  function dispatch(action: ToastAction): void {
    const nextState = toastReducer(state, action);

    // Enforce maxVisible: if adding causes overflow, drop the oldest toasts
    if (
      action.type === "ADD" &&
      nextState.toasts.length > resolvedConfig.maxVisible
    ) {
      const overflow = nextState.toasts.length - resolvedConfig.maxVisible;
      state = {
        ...nextState,
        toasts: nextState.toasts.slice(overflow),
      };
    } else {
      state = nextState;
    }

    // Notify all listeners
    listeners.forEach((listener) => {
      listener(state);
    });
  }

  function subscribe(listener: ToastStoreListener): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getState,
    dispatch,
    subscribe,
    config: resolvedConfig,
  };
}
