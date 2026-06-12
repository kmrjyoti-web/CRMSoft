/**
 * React Toast context, provider, and hooks.
 *
 * Provides a pub/sub-based toast system that integrates with the
 * framework-agnostic store from @coreui/ui.
 */

import React, {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  useCallback,
  useMemo,
} from "react";

import {
  createToastStore,
  createToast,
} from "@coreui/ui";

import type {
  ToastStore,
  ToastConfig,
  ToastVariant,
  ToastData,
  ToastInternalState,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

/** Options accepted by convenience methods (info, success, etc.). */
type ToastInput = string | Omit<Partial<ToastData>, "variant" | "id" | "createdAt">;

/**
 * Imperative API returned by `useToast()`.
 * Provides convenience methods for each variant plus dismiss helpers.
 */
export interface ToastAPI {
  /** Show an info toast. Accepts a description string or an options object. */
  info: (opts: ToastInput) => string;
  /** Show a success toast. Accepts a description string or an options object. */
  success: (opts: ToastInput) => string;
  /** Show a warning toast. Accepts a description string or an options object. */
  warning: (opts: ToastInput) => string;
  /** Show an error toast. Accepts a description string or an options object. */
  error: (opts: ToastInput) => string;
  /** Dismiss a specific toast by ID. */
  dismiss: (id: string) => void;
  /** Dismiss all toasts. */
  dismissAll: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastStore | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Props for the AICToastProvider. */
export interface ToastProviderProps {
  /** Global toast configuration. */
  config?: ToastConfig;
  /** Application content. */
  children: React.ReactNode;
}

/**
 * AICToastProvider wraps the application and creates a single toast store.
 * All toast hooks must be used within a AICToastProvider.
 */
export const AICToastProvider: React.FC<ToastProviderProps> = ({
  config,
  children,
}) => {
  // Create the store once (stable across re-renders)
  const storeRef = useRef<ToastStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createToastStore(config);
  }

  return (
    <ToastContext.Provider value={storeRef.current}>
      {children}
    </ToastContext.Provider>
  );
};

AICToastProvider.displayName = "AICToastProvider";

// ---------------------------------------------------------------------------
// useToastStore (internal)
// ---------------------------------------------------------------------------

/**
 * Hook to access the toast store from context.
 * Throws if used outside a AICToastProvider.
 *
 * Primarily used internally by `useToast`, `useToastState`, and
 * `AICToastContainer`. Exported for advanced use cases.
 */
export function useToastStore(): ToastStore {
  const store = useContext(ToastContext);
  if (store === null) {
    throw new Error(
      "useToast / useToastState must be used within a <AICToastProvider>.",
    );
  }
  return store;
}

// ---------------------------------------------------------------------------
// useToast
// ---------------------------------------------------------------------------

/**
 * Returns the imperative toast API for showing and dismissing toasts.
 *
 * Convenience methods accept either a plain string (treated as the
 * description) or an options object with title, description, duration, etc.
 */
export function useToast(): ToastAPI {
  const store = useToastStore();

  const showToast = useCallback(
    (variant: ToastVariant, opts: ToastInput): string => {
      const input =
        typeof opts === "string"
          ? { description: opts, variant }
          : { ...opts, variant };

      const toast = createToast(input, store.config);
      store.dispatch({ type: "ADD", toast });
      return toast.id;
    },
    [store],
  );

  const api = useMemo<ToastAPI>(
    () => ({
      info: (opts) => showToast("info", opts),
      success: (opts) => showToast("success", opts),
      warning: (opts) => showToast("warning", opts),
      error: (opts) => showToast("error", opts),
      dismiss: (id) => store.dispatch({ type: "DISMISS", id }),
      dismissAll: () => store.dispatch({ type: "DISMISS_ALL" }),
    }),
    [showToast, store],
  );

  return api;
}

// ---------------------------------------------------------------------------
// useToastState
// ---------------------------------------------------------------------------

/**
 * Subscribes to the toast store and returns the current state.
 * Uses `useSyncExternalStore` for tear-free reads in concurrent mode.
 */
export function useToastState(): ToastInternalState {
  const store = useToastStore();

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState, // server snapshot (same as client for SSR)
  );

  return state;
}
