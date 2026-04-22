// Travel Layout Preset — Configuration
import type {
  TravelTheme,
  TravelThemePreset,
  TravelLayoutConfig,
  FontOption,
  FontWeightOption,
  MenuItem,
  ShortcutItem,
} from "./travel.types";

// ── Default Layout Config ───────────────────────────────

export const DEFAULT_TRAVEL_LAYOUT_CONFIG: TravelLayoutConfig = {
  settings: {
    sidebar_type: "glass-sidebar",
    layout_type: "ltr",
    selected_layout: "travel",
  },
  color: {
    primary_color: "#4f46e5",
    secondary_color: "#06b6d4",
  },
};

// ── Default Theme ───────────────────────────────────────
// Colors sourced from --travel-* CSS variable defaults in UI components

export const DEFAULT_TRAVEL_THEME: TravelTheme = {
  headerBg: "#f9fafb",
  sidebarBg: "#ffffff",
  surfaceBg: "#ffffff",
  textMain: "#0f172a",
  textMuted: "#64748b",
  border: "#e5e7eb",
  accent: "#4f46e5",
  error: "#ef4444",
  sidebarHover: "#f3f4f6",

  fontSize: 14,
  fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
  fontWeight: "400",
  zoom: 100,

  glassBlur: "blur(12px)",
  glassOpacity: 0.85,

  bgImage: "",
  bgOpacity: 0.3,

  meshEnabled: true,
  meshColor1: "#818cf8",
  meshColor2: "#06b6d4",
  meshColor3: "#a78bfa",
  meshSpeed: 20,

  themeMode: "light",
  menuPosition: "vertical",
};

// ── Theme Presets ───────────────────────────────────────

export const TRAVEL_THEME_PRESETS: TravelThemePreset[] = [
  {
    name: "Indigo (Default)",
    accent: "#4f46e5",
    headerBg: "#f9fafb",
    sidebarBg: "#ffffff",
    surfaceBg: "#ffffff",
    textMain: "#0f172a",
    border: "#e5e7eb",
    meshColor1: "#818cf8",
    meshColor2: "#06b6d4",
    meshColor3: "#a78bfa",
  },
  {
    name: "Ocean",
    accent: "#0284c7",
    headerBg: "#f0f9ff",
    sidebarBg: "#ffffff",
    surfaceBg: "#ffffff",
    textMain: "#0c4a6e",
    border: "#bae6fd",
    meshColor1: "#38bdf8",
    meshColor2: "#0ea5e9",
    meshColor3: "#7dd3fc",
  },
  {
    name: "Emerald",
    accent: "#059669",
    headerBg: "#f0fdf4",
    sidebarBg: "#ffffff",
    surfaceBg: "#ffffff",
    textMain: "#064e3b",
    border: "#a7f3d0",
    meshColor1: "#34d399",
    meshColor2: "#10b981",
    meshColor3: "#6ee7b7",
  },
  {
    name: "Rose",
    accent: "#e11d48",
    headerBg: "#fff1f2",
    sidebarBg: "#ffffff",
    surfaceBg: "#ffffff",
    textMain: "#881337",
    border: "#fecdd3",
    meshColor1: "#fb7185",
    meshColor2: "#f43f5e",
    meshColor3: "#fda4af",
  },
  {
    name: "Amber",
    accent: "#d97706",
    headerBg: "#fffbeb",
    sidebarBg: "#ffffff",
    surfaceBg: "#ffffff",
    textMain: "#78350f",
    border: "#fde68a",
    meshColor1: "#fbbf24",
    meshColor2: "#f59e0b",
    meshColor3: "#fcd34d",
  },
  {
    name: "Dark Slate",
    accent: "#818cf8",
    headerBg: "#1e293b",
    sidebarBg: "#0f172a",
    surfaceBg: "#1e293b",
    textMain: "#e2e8f0",
    border: "#334155",
    meshColor1: "#6366f1",
    meshColor2: "#8b5cf6",
    meshColor3: "#a78bfa",
  },
  {
    name: "Dark Ocean",
    accent: "#22d3ee",
    headerBg: "#0c1929",
    sidebarBg: "#0a1628",
    surfaceBg: "#0c1929",
    textMain: "#e0f2fe",
    border: "#1e3a5f",
    meshColor1: "#06b6d4",
    meshColor2: "#0891b2",
    meshColor3: "#67e8f9",
  },
  {
    name: "Dark Purple",
    accent: "#a78bfa",
    headerBg: "#1a1025",
    sidebarBg: "#13091f",
    surfaceBg: "#1a1025",
    textMain: "#e8dff5",
    border: "#2e1f4d",
    meshColor1: "#8b5cf6",
    meshColor2: "#7c3aed",
    meshColor3: "#c4b5fd",
  },
];

// ── Available Fonts ─────────────────────────────────────

export const TRAVEL_AVAILABLE_FONTS: FontOption[] = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
];

// ── Font Weights ────────────────────────────────────────

export const TRAVEL_FONT_WEIGHTS: FontWeightOption[] = [
  { label: "Light", value: "300" },
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
];

// ── Default Menu Items ──────────────────────────────────

export const DEFAULT_TRAVEL_MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    icon: "home",
    link: "/dashboard",
    active: true,
  },
  {
    label: "Bookings",
    icon: "calendar",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "Flight Bookings", icon: "circle", link: "/bookings/flights" },
      { label: "Hotel Reservations", icon: "circle", link: "/bookings/hotels" },
      { label: "Package Tours", icon: "circle", link: "/bookings/packages" },
      { label: "Cab Services", icon: "circle", link: "/bookings/cabs" },
    ],
  },
  {
    label: "Customers",
    icon: "users",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "Customer List", icon: "circle", link: "/customers/list" },
      { label: "Customer Groups", icon: "circle", link: "/customers/groups" },
      { label: "Loyalty Program", icon: "circle", link: "/customers/loyalty" },
    ],
  },
  {
    label: "Invoicing",
    icon: "file-text",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "Create Invoice", icon: "circle", link: "/invoicing/create" },
      { label: "Invoice List", icon: "circle", link: "/invoicing/list" },
      { label: "Payments", icon: "circle", link: "/invoicing/payments" },
    ],
  },
  {
    label: "Reports",
    icon: "bar-chart-2",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "Sales Report", icon: "circle", link: "/reports/sales" },
      { label: "Booking Report", icon: "circle", link: "/reports/bookings" },
      { label: "Revenue Analytics", icon: "circle", link: "/reports/revenue" },
    ],
  },
  {
    label: "Suppliers",
    icon: "briefcase",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "Airlines", icon: "circle", link: "/suppliers/airlines" },
      { label: "Hotels", icon: "circle", link: "/suppliers/hotels" },
      { label: "Tour Operators", icon: "circle", link: "/suppliers/operators" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    hasSub: true,
    expanded: false,
    subItems: [
      { label: "General", icon: "circle", link: "/settings/general" },
      { label: "Users & Roles", icon: "circle", link: "/settings/users" },
      { label: "Integrations", icon: "circle", link: "/settings/integrations" },
    ],
  },
];

// ── Shortcut Key Data ───────────────────────────────────

export const TRAVEL_COMMON_KEYS: ShortcutItem[] = [
  { label: "NEW BOOKING", keys: "Alt + N" },
  { label: "BOOKING LIST", keys: "Alt + B" },
  { label: "CUSTOMER LIST", keys: "Alt + C" },
  { label: "NEW INVOICE", keys: "Alt + I" },
  { label: "INVOICE LIST", keys: "Alt + L" },
  { label: "SEARCH", keys: "Ctrl + K" },
  { label: "DASHBOARD", keys: "Alt + H" },
  { label: "REPORTS", keys: "Alt + R" },
  { label: "QUICK PAY", keys: "Alt + P" },
  { label: "SETTINGS", keys: "Ctrl + ," },
];

export const TRAVEL_NAVIGATION_KEYS: ShortcutItem[] = [
  { label: "HOME / DASHBOARD", keys: "Alt + H" },
  { label: "SETTINGS", keys: "Ctrl + ," },
  { label: "HELP", keys: "F1" },
];

export const TRAVEL_BOOKING_KEYS: ShortcutItem[] = [
  { label: "NEW FLIGHT", keys: "Ctrl + Shift + F" },
  { label: "NEW HOTEL", keys: "Ctrl + Shift + H" },
  { label: "NEW PACKAGE", keys: "Ctrl + Shift + P" },
  { label: "CANCEL BOOKING", keys: "Ctrl + Shift + X" },
  { label: "MODIFY BOOKING", keys: "Ctrl + Shift + M" },
];

export const TRAVEL_INVOICE_KEYS: ShortcutItem[] = [
  { label: "CREATE INVOICE", keys: "Ctrl + N" },
  { label: "PRINT INVOICE", keys: "Ctrl + P" },
  { label: "EMAIL INVOICE", keys: "Ctrl + E" },
  { label: "VOID INVOICE", keys: "Ctrl + Shift + V" },
  { label: "DUPLICATE", keys: "Ctrl + D" },
  { label: "APPLY DISCOUNT", keys: "F7" },
];
