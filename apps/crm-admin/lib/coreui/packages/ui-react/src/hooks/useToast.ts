// Source: core/ui-kit/angular/services/toast-helper.service.ts
import { create } from "zustand";

// ── Types ───────────────────────────────────────────────

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastStoreState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// ── Auto-dismiss timers ─────────────────────────────────

const timers = new Map<string, ReturnType<typeof setTimeout>>();

let idCounter = 0;

function generateId(): string {
  return `toast-${Date.now()}-${++idCounter}`;
}

// ── Store ───────────────────────────────────────────────

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });

    // Auto-dismiss after duration (default 5000ms)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        get().removeToast(id);
        timers.delete(id);
      }, duration);
      timers.set(id, timer);
    }

    return id;
  },

  removeToast: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearAll: () => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    set({ toasts: [] });
  },

  success: (message, title) => {
    get().addToast({ type: "success", message, title });
  },

  error: (message, title) => {
    get().addToast({ type: "error", message, title });
  },

  warning: (message, title) => {
    get().addToast({ type: "warning", message, title });
  },

  info: (message, title) => {
    get().addToast({ type: "info", message, title });
  },
}));
