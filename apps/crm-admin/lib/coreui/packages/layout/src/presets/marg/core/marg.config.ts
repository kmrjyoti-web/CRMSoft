// Source: Angular marg-layout.service.ts, marg-theme.service.ts, layout-config.model.ts
import type {
  MargTheme,
  ThemePreset,
  FontOption,
  FontWeightOption,
  BackgroundImageOption,
  MenuItem,
  MargLayoutConfig,
  ShortcutItem,
} from "./marg.types";

// ── Default Layout Config ───────────────────────────────

export const DEFAULT_MARG_LAYOUT_CONFIG: MargLayoutConfig = {
  settings: {
    sidebar_type: "compact-wrapper",
    sidebar_setting: "default-sidebar",
    layout_type: "ltr",
    sidebar_backround: "dark-sidebar",
    selected_layout: "marg",
  },
  color: {
    primary_color: "#7366ff",
    secondary_color: "#f73164",
  },
};

// ── Default Theme ───────────────────────────────────────

export const DEFAULT_MARG_THEME: MargTheme = {
  headerBg: "#1e5f74",
  sidebarBg: "#0d1e25",
  sidebarText: "#b0bec5",
  accent: "#26a69a",
  iconColor: "#90a4ae",
  fontSize: 14,
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontWeight: "400",
  zoom: 100,
  bgImage: "",
  bgFullPage: false,
  bgOpacity: 0.9,
  themeMode: "dark",
  menuPosition: "vertical",
};

// ── Theme Presets ───────────────────────────────────────

export const MARG_THEME_PRESETS: ThemePreset[] = [
  { name: "Teal (Default)", headerBg: "#1e5f74", sidebarBg: "#0d1e25", sidebarText: "#b0bec5", accent: "#26a69a", iconColor: "#90a4ae" },
  { name: "Midnight", headerBg: "#1a237e", sidebarBg: "#000051", sidebarText: "#c5cae9", accent: "#534bae", iconColor: "#9fa8da" },
  { name: "Forest", headerBg: "#2e7d32", sidebarBg: "#1b5e20", sidebarText: "#c8e6c9", accent: "#66bb6a", iconColor: "#a5d6a7" },
  { name: "Crimson", headerBg: "#b71c1c", sidebarBg: "#7f0000", sidebarText: "#ffcdd2", accent: "#e57373", iconColor: "#ef9a9a" },
  { name: "Purple", headerBg: "#4a148c", sidebarBg: "#311b92", sidebarText: "#d1c4e9", accent: "#7e57c2", iconColor: "#b39ddb" },
  { name: "Corporate (Light)", headerBg: "#0078d4", sidebarBg: "#f3f2f1", sidebarText: "#323130", accent: "#0078d4", iconColor: "#605e5c" },
  { name: "Dark Slate", headerBg: "#263238", sidebarBg: "#102027", sidebarText: "#cfd8dc", accent: "#78909c", iconColor: "#90a4ae" },
  { name: "Sunset", headerBg: "#e65100", sidebarBg: "#bf360c", sidebarText: "#ffccbc", accent: "#ff6f00", iconColor: "#ffab91" },
  { name: "Ocean", headerBg: "#01579b", sidebarBg: "#004d40", sidebarText: "#b3e5fc", accent: "#00b0ff", iconColor: "#81d4fa" },
  { name: "Berry", headerBg: "#880e4f", sidebarBg: "#4a148c", sidebarText: "#f8bbd0", accent: "#f50057", iconColor: "#f48fb1" },
  { name: "Charcoal", headerBg: "#212121", sidebarBg: "#000000", sidebarText: "#e0e0e0", accent: "#9e9e9e", iconColor: "#bdbdbd" },
  { name: "Coffee", headerBg: "#4e342e", sidebarBg: "#3e2723", sidebarText: "#d7ccc8", accent: "#8d6e63", iconColor: "#bcaaa4" },
  { name: "Teal Light", headerBg: "#00796b", sidebarBg: "#e0f2f1", sidebarText: "#004d40", accent: "#00695c", iconColor: "#00897b" },
  { name: "Royal", headerBg: "#f9a825", sidebarBg: "#212121", sidebarText: "#fff9c4", accent: "#ffeb3b", iconColor: "#fff59d" },
];

// ── Available Fonts ─────────────────────────────────────

export const MARG_AVAILABLE_FONTS: FontOption[] = [
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
  { label: "Helvetica", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
];

// ── Font Weights ────────────────────────────────────────

export const MARG_FONT_WEIGHTS: FontWeightOption[] = [
  { label: "Light", value: "300" },
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
];

// ── Background Images ───────────────────────────────────

export const MARG_BACKGROUND_IMAGES: BackgroundImageOption[] = [
  { label: "None", value: "" },
  { label: "Space", value: "url(\"https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Nebula", value: "url(\"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Abstract", value: "url(\"https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Mountain", value: "url(\"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Ocean", value: "url(\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Forest", value: "url(\"https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "City", value: "url(\"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Technology", value: "url(\"https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Geometric", value: "url(\"https://images.unsplash.com/photo-1550684847-75bdda21cc95?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Minimal", value: "url(\"https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
  { label: "Dark", value: "url(\"https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\")" },
];

// ── Default Menu Items ──────────────────────────────────

export const DEFAULT_MARG_MENU_ITEMS: MenuItem[] = [
  {
    label: "Log", icon: "file-text", hasSub: true, expanded: false,
    subItems: [
      { label: "Unit Test Logs", icon: "check-square", link: "/platform-console/unit-test-logs" },
      { label: "Error Logs", icon: "alert-circle", link: "/platform-console/error-management" },
    ],
  },
  {
    label: "Error", icon: "alert-triangle", hasSub: true, expanded: false,
    subItems: [
      { label: "Error Events", icon: "circle", link: "/platform-console/error-management" },
      { label: "Module Management", icon: "circle", link: "/platform-console/module-management" },
    ],
  },
  {
    label: "Document", icon: "folder", hasSub: true, expanded: false,
    subItems: [
      { label: "Documents Center", icon: "circle", link: "/platform-console/docs-center" },
      { label: "DB Management", icon: "database", link: "/platform-console/db-management" },
    ],
  },
  {
    label: "AI Activity", icon: "cpu", hasSub: true, expanded: false,
    subItems: [
      { label: "AI Session Logs", icon: "circle", link: "/platform-console/ai-session-logs" },
      { label: "Platform Core", icon: "command", link: "/platform-console/platform-core" },
    ],
  },
  {
    label: "Document Center", icon: "book-open", hasSub: true, expanded: false,
    subItems: [
      { label: "Architecture Docs", icon: "circle", link: "/platform-console/docs-center" },
      { label: "API Reference", icon: "circle", link: "/platform-console/docs-center" },
    ],
  },
  {
    label: "Testing", icon: "activity", hasSub: true, expanded: false,
    subItems: [
      { label: "Unit Test Reports", icon: "circle", link: "/platform-console/unit-test-logs" },
      { label: "Test Coverage", icon: "circle", link: "/platform-console/unit-test-logs" },
    ],
  },
  {
    label: "UIKit", icon: "layers", hasSub: true, expanded: true, active: true,
    subItems: [
      { label: "Text & Inputs", icon: "type", link: "/platform-console/ui-kit/text-inputs", active: true },
      { label: "Selectors", icon: "list", link: "/platform-console/ui-kit/selectors" },
      { label: "Checks & Radios", icon: "check-circle", link: "/platform-console/ui-kit/checks-radios" },
      { label: "Specialized Inputs", icon: "star", link: "/platform-console/ui-kit/specialized" },
      { label: "Date & Time", icon: "calendar", link: "/platform-console/ui-kit/date-time" },
      { label: "Interactive", icon: "sliders", link: "/platform-console/ui-kit/interactive" },
      { label: "Files & Signature", icon: "paperclip", link: "/platform-console/ui-kit/files-signature" },
      { label: "AIC Search", icon: "search", link: "/platform-console/ui-kit/aic-search" },
      { label: "Actions / Buttons", icon: "mouse-pointer", link: "/platform-console/ui-kit/actions" },
      { label: "AIC Toolbar", icon: "menu", link: "/platform-console/ui-kit/aic-toolbar" },
      { label: "AIC Table", icon: "grid", link: "/platform-console/ui-kit/aic-table" },
      { label: "Rich Text Editor", icon: "edit-3", link: "/platform-console/ui-kit/editor" },
      { label: "AIC Button", icon: "square", link: "/platform-console/ui-kit/aic-button" },
      { label: "AIC Dialog", icon: "message-square", link: "/platform-console/ui-kit/aic-dialog" },
      { label: "AIC Icon", icon: "aperture", link: "/platform-console/ui-kit/aic-icon" },
      { label: "AIC Autocomplete (Component)", icon: "search", link: "/platform-console/ui-kit/aic-autocomplete-component" },
      { label: "AIC Drawer", icon: "sidebar", link: "/platform-console/ui-kit/aic-drawer" },
      { label: "Sync Indicator", icon: "refresh-cw", link: "/platform-console/ui-kit/sync-indicator" },
      { label: "AIC Toast", icon: "bell", link: "/platform-console/ui-kit/aic-toast" },
      { label: "AIC Error", icon: "alert-octagon", link: "/platform-console/ui-kit/aic-error" },
      {
        label: "Toolbar Button", icon: "columns", hasSub: true, expanded: false,
        subItems: [
          { label: "Button", icon: "minus-square", link: "/platform-console/ui-kit/toolbar-button" },
          { label: "Toolbar Group Button", icon: "columns", link: "/platform-console/ui-kit/toolbar-button-group" },
        ],
      },
      { label: "AIC Number", icon: "hash", link: "/platform-console/ui-kit/aic-number" },
      { label: "AIC Inputmask", icon: "sliders", link: "/platform-console/ui-kit/aic-inputmask" },
    ],
  },
];

// ── Shortcut Key Data ───────────────────────────────────

export const MARG_COMMON_KEYS: ShortcutItem[] = [
  { label: "SALE BILL", keys: "Alt + N" },
  { label: "SALE BILL LIST", keys: "Alt + M" },
  { label: "PURCHASE BILL", keys: "Alt + P" },
  { label: "ITEM LIST", keys: "Alt + I" },
  { label: "LEDGER LIST", keys: "Alt + L" },
  { label: "PARTY WISE OUTSTANDING", keys: "Alt+O" },
  { label: "RE-ORDER", keys: "Ctrl+F1" },
  { label: "RECEIPT", keys: "Alt + R" },
  { label: "PAYMENT", keys: "Ctrl + F2" },
  { label: "CASH A/C AND BANK A/C", keys: "Alt + B" },
  { label: "SALE BILL CHALLAN", keys: "Alt + C" },
  { label: "STOCK ISSUE", keys: "Alt + K" },
  { label: "STOCK RECEIVE", keys: "Alt + U" },
  { label: "BREAKAGE/EXPRECEIVE", keys: "Alt + X" },
  { label: "COUNTER SALE", keys: "Alt + A" },
];

export const MARG_NAVIGATION_KEYS: ShortcutItem[] = [
  { label: "HOME/DASHBOARD", keys: "Alt + H" },
  { label: "SETTINGS", keys: "Ctrl+I" },
  { label: "CALCULATOR", keys: "Alt + F12" },
];

export const MARG_SALE_WINDOW_KEYS: ShortcutItem[] = [
  { label: "CHANGE CALCULATION", keys: "CTRL + R" },
  { label: "FAST SCANNING", keys: "CTRL + B" },
  { label: "LAST DEAL", keys: "ALT + D" },
  { label: "Net rate", keys: "*" },
  { label: "CREATE PRESCRIPTION (IN CHEMIST)", keys: "F7" },
  { label: "LOT RATE", keys: "F7" },
];

export const MARG_ITEM_LIST_KEYS: ShortcutItem[] = [
  { label: "ITEM LEDGER", keys: "F4" },
  { label: "OLD RATE", keys: "F6" },
  { label: "SUBSTITITUE", keys: "F7" },
  { label: "GROUP", keys: "F8" },
  { label: "COMPANY", keys: "F9" },
  { label: "CATEGORY", keys: "ALT +F11" },
  { label: "SHORTAGE", keys: "*" },
];

// ── Default Nav Items ───────────────────────────────────

export { type NavMenu } from "./marg.types";
