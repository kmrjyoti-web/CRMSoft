/**
 * Toast state reducer and logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed user interactions into the reducer
 * via dispatched actions to manage the toast notification queue.
 */

import type { ToastData, ToastVariant, ToastConfig } from "./toast.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the toast reducer handles. */
export type ToastAction =
  | { type: "ADD"; toast: ToastData }
  | { type: "DISMISS"; id: string }
  | { type: "DISMISS_ALL" }
  | { type: "PAUSE"; id: string }
  | { type: "RESUME"; id: string }
  | { type: "UPDATE"; id: string; updates: Partial<ToastData> };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal state tracked by the toast reducer. */
export interface ToastInternalState {
  /** Ordered list of active toasts (newest last). */
  toasts: ToastData[];
  /** IDs of toasts whose auto-dismiss timer is paused. */
  pausedIds: string[];
}

/** Starting state — no toasts. */
export const initialToastState: ToastInternalState = {
  toasts: [],
  pausedIds: [],
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for toast notifications.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function toastReducer(
  state: ToastInternalState,
  action: ToastAction,
): ToastInternalState {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };

    case "DISMISS":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
        pausedIds: state.pausedIds.filter((pid) => pid !== action.id),
      };

    case "DISMISS_ALL":
      return {
        ...state,
        toasts: [],
        pausedIds: [],
      };

    case "PAUSE": {
      if (state.pausedIds.includes(action.id)) {
        return state;
      }
      return {
        ...state,
        pausedIds: [...state.pausedIds, action.id],
      };
    }

    case "RESUME":
      return {
        ...state,
        pausedIds: state.pausedIds.filter((pid) => pid !== action.id),
      };

    case "UPDATE":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t,
        ),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a unique ID for a toast using timestamp and random value.
 *
 * @returns A unique string identifier.
 */
export function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a fully formed `ToastData` object with sensible defaults.
 *
 * @param input  - Partial toast data with required `variant`.
 * @param config - Optional global toast configuration for default values.
 * @returns Complete `ToastData` object.
 */
export function createToast(
  input: Partial<ToastData> & { variant: ToastVariant },
  config?: ToastConfig,
): ToastData {
  const defaultDuration = config?.defaultDuration ?? 5000;

  return {
    id: input.id ?? generateToastId(),
    title: input.title,
    description: input.description,
    variant: input.variant,
    duration: input.duration ?? defaultDuration,
    action: input.action,
    createdAt: input.createdAt ?? Date.now(),
  };
}
