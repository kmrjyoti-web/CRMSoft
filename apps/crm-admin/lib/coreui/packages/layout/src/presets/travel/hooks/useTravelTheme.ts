// Travel Theme Service → Zustand hook
// Unique features: glassmorphism, mesh gradient, zoom container, bg image layer
import { create } from "zustand";
import type { TravelTheme, TravelThemePreset } from "../core/travel.types";
import { DEFAULT_TRAVEL_THEME } from "../core/travel.config";

// ── Color Helpers ───────────────────────────────────────

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
// Sets --travel-* CSS variables consumed by aic-table, aic-drawer,
// aic-toolbar, and Travel layout components

function applyThemeToDOM(theme: TravelTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Core surface colors (consumed by UI components)
  root.style.setProperty("--travel-header-bg", theme.headerBg);
  root.style.setProperty("--travel-sidebar-bg", theme.sidebarBg);
  root.style.setProperty("--travel-surface-bg", theme.surfaceBg);
  root.style.setProperty("--travel-text-main", theme.textMain);
  root.style.setProperty("--travel-text-muted", theme.textMuted);
  root.style.setProperty("--travel-border", theme.border);
  root.style.setProperty("--travel-accent", theme.accent);
  root.style.setProperty("--travel-error", theme.error);
  root.style.setProperty("--travel-sidebar-hover", theme.sidebarHover);

  // Typography
  root.style.setProperty("--travel-font-family", theme.fontFamily);
  root.style.setProperty("--travel-font-size", theme.fontSize + "px");
  root.style.setProperty("--travel-font-weight", theme.fontWeight);

  // Zoom
  const scale = theme.zoom / 100;
  root.style.setProperty("--travel-zoom-scale", scale.toString());

  // Glassmorphism
  root.style.setProperty("--travel-glass-blur", theme.glassBlur);
  root.style.setProperty("--travel-glass-opacity", theme.glassOpacity.toString());
  root.style.setProperty(
    "--travel-glass-bg",
    addAlpha(theme.sidebarBg, theme.glassOpacity),
  );

  // Background image layer
  if (theme.bgImage) {
    root.style.setProperty("--travel-bg-image", theme.bgImage);
    root.style.setProperty("--travel-bg-opacity", theme.bgOpacity.toString());
  } else {
    root.style.setProperty("--travel-bg-image", "none");
    root.style.setProperty("--travel-bg-opacity", "0");
  }

  // Mesh gradient
  root.style.setProperty("--travel-mesh-color-1", theme.meshColor1);
  root.style.setProperty("--travel-mesh-color-2", theme.meshColor2);
  root.style.setProperty("--travel-mesh-color-3", theme.meshColor3);
  root.style.setProperty("--travel-mesh-speed", theme.meshSpeed + "s");
  root.style.setProperty(
    "--travel-mesh-enabled",
    theme.meshEnabled ? "1" : "0",
  );

  // Drawer integration (matches pattern from Marg)
  root.style.setProperty("--drawer-header-bg", addAlpha(theme.headerBg, 0.05));
  root.style.setProperty("--drawer-footer-bg", theme.surfaceBg);
  root.style.setProperty("--drawer-accent-color", theme.accent);
  root.style.setProperty("--drawer-header-border", addAlpha(theme.border, 0.5));
  root.style.setProperty("--drawer-text-color", theme.textMain);
}

// ── Store ───────────────────────────────────────────────

interface TravelThemeStore {
  theme: TravelTheme;

  updateTheme: (partial: Partial<TravelTheme>) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  setGlassOpacity: (opacity: number) => void;
  setMeshEnabled: (enabled: boolean) => void;
  setMeshSpeed: (speed: number) => void;
  setBgImage: (url: string) => void;
  setBgOpacity: (opacity: number) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  applyPreset: (preset: TravelThemePreset) => void;
  reset: () => void;
}

export const useTravelTheme = create<TravelThemeStore>((set) => ({
  theme: { ...DEFAULT_TRAVEL_THEME },

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

  setGlassOpacity: (opacity) =>
    set((state) => {
      const next = { ...state.theme, glassOpacity: opacity };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setMeshEnabled: (enabled) =>
    set((state) => {
      const next = { ...state.theme, meshEnabled: enabled };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setMeshSpeed: (speed) =>
    set((state) => {
      const next = { ...state.theme, meshSpeed: speed };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  setBgImage: (url) =>
    set((state) => {
      const bgImage = url ? `url("${url}")` : "";
      const next = { ...state.theme, bgImage };
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
      let colors: Partial<TravelTheme>;
      if (mode === "dark") {
        colors = {
          headerBg: "#1e293b",
          sidebarBg: "#0f172a",
          surfaceBg: "#1e293b",
          textMain: "#e2e8f0",
          textMuted: "#94a3b8",
          border: "#334155",
          accent: "#818cf8",
          error: "#f87171",
          sidebarHover: "#1e293b",
          meshColor1: "#6366f1",
          meshColor2: "#8b5cf6",
          meshColor3: "#a78bfa",
          themeMode: "dark",
        };
      } else {
        colors = {
          headerBg: "#f9fafb",
          sidebarBg: "#ffffff",
          surfaceBg: "#ffffff",
          textMain: "#0f172a",
          textMuted: "#64748b",
          border: "#e5e7eb",
          accent: "#4f46e5",
          error: "#ef4444",
          sidebarHover: "#f3f4f6",
          meshColor1: "#818cf8",
          meshColor2: "#06b6d4",
          meshColor3: "#a78bfa",
          themeMode: "light",
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
        accent: preset.accent,
        headerBg: preset.headerBg,
        sidebarBg: preset.sidebarBg,
        surfaceBg: preset.surfaceBg,
        textMain: preset.textMain,
        border: preset.border,
        meshColor1: preset.meshColor1,
        meshColor2: preset.meshColor2,
        meshColor3: preset.meshColor3,
      };
      applyThemeToDOM(next);
      return { theme: next };
    }),

  reset: () =>
    set(() => {
      const next = { ...DEFAULT_TRAVEL_THEME };
      applyThemeToDOM(next);
      return { theme: next };
    }),
}));
