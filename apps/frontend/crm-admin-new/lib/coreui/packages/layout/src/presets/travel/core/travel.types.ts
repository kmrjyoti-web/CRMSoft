// Travel Layout Preset — Types
// Reuses shared types: MenuItem, ShortcutConfig, ShortcutItem, ShortcutGroup
// from marg.types (same menu / shortcut shape)

export type { MenuItem, ShortcutConfig, ShortcutItem, ShortcutGroup } from "../../marg/core/marg.types";

// ── Travel Theme ────────────────────────────────────────

export interface TravelTheme {
  // Surface colors
  headerBg: string;
  sidebarBg: string;
  surfaceBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  accent: string;
  error: string;
  sidebarHover: string;

  // Typography
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  zoom: number;

  // Glassmorphism
  glassBlur: string;
  glassOpacity: number;

  // Background image layer
  bgImage: string;
  bgOpacity: number;

  // Mesh gradient
  meshEnabled: boolean;
  meshColor1: string;
  meshColor2: string;
  meshColor3: string;
  meshSpeed: number; // seconds for animation cycle

  // Layout
  themeMode: "light" | "dark";
  menuPosition: "vertical" | "horizontal";
}

export interface TravelThemePreset {
  name: string;
  accent: string;
  headerBg: string;
  sidebarBg: string;
  surfaceBg: string;
  textMain: string;
  border: string;
  meshColor1: string;
  meshColor2: string;
  meshColor3: string;
}

export interface FontOption {
  label: string;
  value: string;
}

export interface FontWeightOption {
  label: string;
  value: string;
}

// ── Layout Config ───────────────────────────────────────

export interface TravelLayoutConfig {
  settings: {
    sidebar_type: string;
    layout_type: "ltr" | "rtl";
    selected_layout: string;
  };
  color: {
    primary_color: string;
    secondary_color: string;
  };
}
