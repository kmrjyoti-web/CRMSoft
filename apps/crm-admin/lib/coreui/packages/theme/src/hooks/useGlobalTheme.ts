// Source: core/ui-kit/angular/services/global-theme.service.ts
import { create } from "zustand";

// ── Types ───────────────────────────────────────────────

export interface GlobalThemeState {
  currentTheme: string;
  tokens: Record<string, string>;
  setTheme: (themeName: string) => void;
  setToken: (key: string, value: string) => void;
  setTokens: (tokens: Record<string, string>) => void;
  applyToDocument: () => void;
  removeFromDocument: () => void;
}

// ── Store ───────────────────────────────────────────────

export const useGlobalTheme = create<GlobalThemeState>((set, get) => ({
  currentTheme: "default",
  tokens: {},

  setTheme: (themeName) => {
    set({ currentTheme: themeName });
  },

  setToken: (key, value) => {
    set({ tokens: { ...get().tokens, [key]: value } });
  },

  setTokens: (tokens) => {
    set({ tokens: { ...get().tokens, ...tokens } });
  },

  applyToDocument: () => {
    const { tokens } = get();
    const root = document.documentElement;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }
  },

  removeFromDocument: () => {
    const { tokens } = get();
    const root = document.documentElement;
    for (const key of Object.keys(tokens)) {
      root.style.removeProperty(key);
    }
  },
}));
