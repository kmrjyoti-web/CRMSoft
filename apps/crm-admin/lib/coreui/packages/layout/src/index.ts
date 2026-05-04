// Layout types
export type {
  LayoutConfig,
  SidebarConfig,
  SidebarPosition,
  HeaderConfig,
  FooterConfig,
  BreadcrumbConfig,
} from "./core/layout.types";

// Layout engine
export {
  defaultLayoutConfig,
  resolveLayout,
  generateLayoutCSS,
} from "./core/layout.engine";

// Shortcut engine
export { ShortcutEngine } from "./core/shortcut.engine";
export type {
  ShortcutDefinition,
  ModifierKey,
} from "./core/shortcut.engine";

// Density types & engine
export type { DensityLevel, DensityConfig } from "./core/density.types";
export { resolveDensity, generateDensityCSS } from "./core/density.engine";

// ── Shared Layout Hooks (P1.1) ─────────────────────────
export { useLayout } from "./shared/hooks/useLayout";
export { usePageLayout } from "./shared/hooks/usePageLayout";
export { useNav } from "./shared/hooks/useNav";

// ── Marg Layout Preset (P1.1) ──────────────────────────
export * from "./presets/marg";

// ── Travel Layout Preset (P1.2) ────────────────────────
export * from "./presets/travel";
