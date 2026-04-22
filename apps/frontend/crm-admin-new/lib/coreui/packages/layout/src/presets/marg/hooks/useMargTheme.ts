// Source: Angular services/marg-theme.service.ts
import { create } from "zustand";
import type { MargTheme, ThemePreset } from "../core/marg.types";
import { DEFAULT_MARG_THEME } from "../core/marg.config";

// ── Color Helpers (from Angular applyTheme) ─────────────

function darkenColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith("#")) return hex;
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) - amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) - amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) - amt));
  return (
    "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
  );
}

function addAlpha(hex: string, alpha: number): string {
  if (hex && hex.startsWith("#")) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

// ── Apply Theme to DOM ──────────────────────────────────

function applyThemeToDOM(theme: MargTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Colors
  root.style.setProperty("--marg-header-bg", theme.headerBg);
  root.style.setProperty("--marg-sidebar-bg", theme.sidebarBg);
  root.style.setProperty("--marg-sidebar-text", theme.sidebarText);
  root.style.setProperty("--marg-accent", theme.accent);
  root.style.setProperty("--marg-icon-color", theme.iconColor);

  // Footer
  const footerBg = darkenColor(theme.headerBg, 30);
  root.style.setProperty("--marg-footer-bg", footerBg);

  // Font & Zoom
  root.style.setProperty("--marg-base-font-size", theme.fontSize + "px");
  root.style.setProperty("--marg-font-family", theme.fontFamily);
  root.style.setProperty("--marg-font-stack", theme.fontFamily);
  root.style.setProperty("--marg-font-weight", theme.fontWeight);

  const scale = theme.zoom / 100;
  root.style.setProperty("--marg-zoom-scale", scale.toString());

  // Background Image
  if (theme.bgFullPage && theme.bgImage) {
    document.body.style.backgroundImage = theme.bgImage;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    root.style.setProperty("--marg-header-bg", addAlpha(theme.headerBg, theme.bgOpacity));
    root.style.setProperty("--marg-sidebar-bg", addAlpha(theme.sidebarBg, theme.bgOpacity));
    root.style.setProperty("--marg-footer-bg", addAlpha(footerBg, theme.bgOpacity));
  } else {
    document.body.style.backgroundImage = "none";
    root.style.setProperty("--marg-header-bg", theme.headerBg);
    root.style.setProperty("--marg-sidebar-bg", theme.sidebarBg);
    root.style.setProperty("--marg-footer-bg", footerBg);
  }

  // Drawer integration
  root.style.setProperty("--drawer-header-bg", addAlpha(theme.headerBg, 0.05));
  root.style.setProperty("--drawer-footer-bg", "#ffffff");
  root.style.setProperty("--drawer-accent-color", theme.accent);
  root.style.setProperty("--drawer-header-border", "rgba(0,0,0,0.08)");
  root.style.setProperty("--drawer-text-color", theme.headerBg);
}

// ── Store ───────────────────────────────────────────────

interface MargThemeStore {
  theme: MargTheme;

  updateTheme: (partial: Partial<MargTheme>) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  setBgOpacity: (opacity: number) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  applyPreset: (preset: ThemePreset) => void;
  reset: () => void;
}

export const useMargTheme = create<MargThemeStore>((set) => ({
  theme: { ...DEFAULT_MARG_THEME },

  updateTheme: (partial) =>
    set((state) => {
      const next = { ...state.theme, ...partial };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setFontFamily: (font) =>
    set((state) => {
      const next = { ...state.theme, fontFamily: font };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setFontSize: (size) =>
    set((state) => {
      const next = { ...state.theme, fontSize: size };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  increaseFontSize: () =>
    set((state) => {
      const next = { ...state.theme, fontSize: Math.min(state.theme.fontSize + 1, 24) };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  decreaseFontSize: () =>
    set((state) => {
      const next = { ...state.theme, fontSize: Math.max(state.theme.fontSize - 1, 10) };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  increaseZoom: () =>
    set((state) => {
      const next = { ...state.theme, zoom: Math.min(state.theme.zoom + 5, 200) };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  decreaseZoom: () =>
    set((state) => {
      const next = { ...state.theme, zoom: Math.max(state.theme.zoom - 5, 50) };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setBgOpacity: (opacity) =>
    set((state) => {
      const next = { ...state.theme, bgOpacity: opacity };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setThemeMode: (mode) =>
    set((state) => {
      let colors: Partial<MargTheme> = {};
      if (mode === "light") {
        colors = {
          headerBg: "#ffffff",
          sidebarBg: "#f5f5f5",
          sidebarText: "#333333",
          iconColor: "#555555",
          accent: "#006064",
          themeMode: "light",
        };
      } else {
        colors = {
          headerBg: "#1e5f74",
          sidebarBg: "#0d1e25",
          sidebarText: "#b0bec5",
          iconColor: "#90a4ae",
          accent: "#26a69a",
          themeMode: "dark",
        };
      }
      const next = { ...state.theme, ...colors };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  applyPreset: (preset) =>
    set((state) => {
      const next = {
        ...state.theme,
        headerBg: preset.headerBg,
        sidebarBg: preset.sidebarBg,
        sidebarText: preset.sidebarText,
        accent: preset.accent,
        iconColor: preset.iconColor,
      };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  reset: () =>
    set(() => {
      const next = { ...DEFAULT_MARG_THEME };
      applyThemeToDOM(next);
      return { theme: next };
    }),
}));
