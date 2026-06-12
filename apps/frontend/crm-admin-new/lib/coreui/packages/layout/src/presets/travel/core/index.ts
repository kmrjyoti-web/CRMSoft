export type {
  TravelTheme,
  TravelThemePreset,
  TravelLayoutConfig,
} from "./travel.types";
// FontOption, FontWeightOption, MenuItem, ShortcutConfig, ShortcutItem,
// ShortcutGroup are re-exported from marg.types — use them via the marg preset
// to avoid duplicate export ambiguity.

export {
  DEFAULT_TRAVEL_LAYOUT_CONFIG,
  DEFAULT_TRAVEL_THEME,
  TRAVEL_THEME_PRESETS,
  TRAVEL_AVAILABLE_FONTS,
  TRAVEL_FONT_WEIGHTS,
  DEFAULT_TRAVEL_MENU_ITEMS,
  TRAVEL_COMMON_KEYS,
  TRAVEL_NAVIGATION_KEYS,
  TRAVEL_BOOKING_KEYS,
  TRAVEL_INVOICE_KEYS,
} from "./travel.config";
