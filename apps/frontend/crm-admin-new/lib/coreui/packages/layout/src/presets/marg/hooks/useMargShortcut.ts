// Source: Angular services/marg-shortcut.service.ts
import { create } from "zustand";
import type { ShortcutConfig } from "../core/marg.types";

interface MargShortcutStore {
  globalShortcuts: ShortcutConfig[];
  pageShortcuts: ShortcutConfig[];

  registerGlobal: (config: ShortcutConfig) => void;
  registerPage: (config: ShortcutConfig) => void;
  clearPageShortcuts: () => void;
  handleKey: (event: KeyboardEvent) => boolean;
  getAllShortcuts: () => ShortcutConfig[];
}

export const useMargShortcut = create<MargShortcutStore>((set, get) => ({
  globalShortcuts: [],
  pageShortcuts: [],

  registerGlobal: (config) =>
    set((state) => ({
      globalShortcuts: [...state.globalShortcuts, config],
    })),

  registerPage: (config) =>
    set((state) => ({
      pageShortcuts: [...state.pageShortcuts, config],
    })),

  clearPageShortcuts: () => set({ pageShortcuts: [] }),

  handleKey: (event: KeyboardEvent): boolean => {
    const key = event.key.toLowerCase();
    const alt = event.altKey;
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const meta = event.metaKey;

    const { pageShortcuts, globalShortcuts } = get();

    // 1. Page shortcuts have priority
    const pageMatch = pageShortcuts.find(
      (s) =>
        s.key.toLowerCase() === key &&
        !!s.alt === alt &&
        !!s.ctrl === ctrl &&
        !!s.shift === shift &&
        !!s.meta === meta,
    );

    if (pageMatch) {
      pageMatch.action();
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    // 2. Global shortcuts
    const globalMatch = globalShortcuts.find(
      (s) =>
        s.key.toLowerCase() === key &&
        !!s.alt === alt &&
        !!s.ctrl === ctrl &&
        !!s.shift === shift &&
        !!s.meta === meta,
    );

    if (globalMatch) {
      globalMatch.action();
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  },

  getAllShortcuts: () => {
    const { globalShortcuts, pageShortcuts } = get();
    return [...pageShortcuts, ...globalShortcuts];
  },
}));
