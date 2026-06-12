// Source: core/ui-kit/angular/src/lib/control-library/services/confirm-dialog.service.ts
import { create } from "zustand";
import type { ConfirmDialogConfig } from "@coreui/ui";

// ── Types ───────────────────────────────────────────────

export interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmDialogConfig | null;
  open: (config: ConfirmDialogConfig) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
  close: () => void;
}

// ── Internal resolve reference ──────────────────────────

let resolveFn: ((result: boolean) => void) | null = null;

// ── Store ───────────────────────────────────────────────

export const useConfirmDialog = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  config: null,

  open: (config) => {
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve;
      set({ isOpen: true, config });
    });
  },

  confirm: () => {
    set({ isOpen: false, config: null });
    resolveFn?.(true);
    resolveFn = null;
  },

  cancel: () => {
    set({ isOpen: false, config: null });
    resolveFn?.(false);
    resolveFn = null;
  },

  close: () => {
    set({ isOpen: false, config: null });
    resolveFn?.(false);
    resolveFn = null;
  },
}));
