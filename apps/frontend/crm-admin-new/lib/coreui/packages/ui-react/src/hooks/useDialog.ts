// Source: core/ui-kit/angular/services/dialog-helper.service.ts
import { create } from "zustand";

// ── Types ───────────────────────────────────────────────

export interface DialogState {
  isOpen: boolean;
  data: unknown;
  open: (data?: unknown) => void;
  close: () => void;
  toggle: () => void;
}

// ── Store ───────────────────────────────────────────────

export const useDialog = create<DialogState>((set, get) => ({
  isOpen: false,
  data: null,

  open: (data) => {
    set({ isOpen: true, data: data ?? null });
  },

  close: () => {
    set({ isOpen: false, data: null });
  },

  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, data: null });
    } else {
      set({ isOpen: true });
    }
  },
}));
