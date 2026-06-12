// Source: Angular marg-layout.service.ts, marg-theme.service.ts, marg-shortcut.service.ts

// ── Menu ────────────────────────────────────────────────

export interface MenuItem {
  label: string;
  icon: string;
  active?: boolean;
  hasSub?: boolean;
  expanded?: boolean;
  subItems?: MenuItem[];
  link?: string;
  createLink?: string;
}

// ── Theme ───────────────────────────────────────────────

export interface MargTheme {
  headerBg: string;
  sidebarBg: string;
  sidebarText: string;
  accent: string;
  iconColor: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  zoom: number;
  bgImage: string;
  bgFullPage: boolean;
  bgOpacity: number;
  themeMode: "light" | "dark" | "system";
  menuPosition: "vertical" | "horizontal";
}

export interface ThemePreset {
  name: string;
  headerBg: string;
  sidebarBg: string;
  sidebarText: string;
  accent: string;
  iconColor: string;
}

export interface FontOption {
  label: string;
  value: string;
}

export interface FontWeightOption {
  label: string;
  value: string;
}

export interface BackgroundImageOption {
  label: string;
  value: string;
}

// ── Shortcuts ───────────────────────────────────────────

export interface ShortcutConfig {
  key: string;
  alt?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export interface ShortcutItem {
  label: string;
  keys: string;
}

export interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

// ── Layout Config ───────────────────────────────────────

export interface MargLayoutConfig {
  settings: {
    sidebar_type: string;
    sidebar_setting: string;
    layout_type: "ltr" | "rtl" | "box-layout";
    sidebar_backround: string;
    selected_layout: string;
  };
  color: {
    primary_color: string;
    secondary_color: string;
  };
}

// ── Nav ─────────────────────────────────────────────────

export interface NavMenu {
  headTitle1?: string;
  headTitle2?: string;
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  badgeType?: string;
  badgeValue?: string;
  active?: boolean;
  bookmark?: boolean;
  children?: NavMenu[];
}

// ── Layout Store State ──────────────────────────────────

export interface LayoutState {
  isSidebarClosed: boolean;
  isSearchOpen: boolean;
  menuPosition: "vertical" | "horizontal";
  config: MargLayoutConfig;
}

export interface PageLayoutState {
  showMainHeader: boolean;
  showMainSidebar: boolean;
  showMainFooter: boolean;
}
