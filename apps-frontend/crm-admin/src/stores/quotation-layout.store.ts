import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export type RowHeight = "compact" | "normal" | "comfortable";
export type ProductSelectMode = "autocomplete" | "popup";

/** Which column's Tab key press appends a new row (when on the last row). */
export type NewRowTriggerCol = "product" | "qty" | "unit" | "unitPrice" | "discount" | "gst" | "lineTotal";

export const ROW_HEIGHT_PX: Record<RowHeight, number> = {
  compact: 32,
  normal: 40,
  comfortable: 52,
};

export interface ColWidths {
  qty: number;
  unit: number;
  unitPrice: number;
  discount: number;
  gst: number;
  lineTotal: number;
}

export const COL_DEFS: { key: keyof ColWidths; label: string }[] = [
  { key: "qty",       label: "Qty" },
  { key: "unit",      label: "Unit" },
  { key: "unitPrice", label: "Unit Price" },
  { key: "discount",  label: "Discount" },
  { key: "gst",       label: "GST %" },
  { key: "lineTotal", label: "Line Total" },
];

export const DEFAULT_COL_WIDTHS: ColWidths = {
  qty:       70,
  unit:      96,
  unitPrice: 110,
  discount:  160,
  gst:       90,
  lineTotal: 110,
};

export interface SectionHeightConfig {
  mode: "fixed" | "auto";
  fixedPx: number;
  detectedPx: number | null;
}

export interface QuotationLayoutConfig {
  colWidths: ColWidths;
  draftWidths: ColWidths;
  rowHeight: RowHeight;
  autoDetectGridSize: boolean;
  productSelectMode: ProductSelectMode;
  newRowTriggerCol: NewRowTriggerCol;
  header: SectionHeightConfig;
  footer: SectionHeightConfig;
}

const DEFAULT_SECTION: SectionHeightConfig = {
  mode: "auto",
  fixedPx: 56,
  detectedPx: null,
};

const DEFAULT_CONFIG: QuotationLayoutConfig = {
  colWidths: { ...DEFAULT_COL_WIDTHS },
  draftWidths: { ...DEFAULT_COL_WIDTHS },
  rowHeight: "normal",
  autoDetectGridSize: true,
  productSelectMode: "autocomplete",
  newRowTriggerCol: "lineTotal",
  header: { ...DEFAULT_SECTION },
  footer: { ...DEFAULT_SECTION },
};

// ── Store ──────────────────────────────────────────────────────────────────

interface QuotationLayoutStore {
  configs: Record<string, QuotationLayoutConfig>;

  getConfig: (key: string) => QuotationLayoutConfig;

  setDraftWidth: (key: string, col: keyof ColWidths, value: number) => void;
  applyDraftWidths: (key: string) => void;
  resetDraftWidths: (key: string) => void;

  setRowHeight: (key: string, height: RowHeight) => void;
  setAutoDetectGridSize: (key: string, enabled: boolean) => void;
  setProductSelectMode: (key: string, mode: ProductSelectMode) => void;
  setNewRowTriggerCol: (key: string, col: NewRowTriggerCol) => void;

  setHeaderConfig: (key: string, partial: Partial<SectionHeightConfig>) => void;
  setFooterConfig: (key: string, partial: Partial<SectionHeightConfig>) => void;

  removeConfig: (key: string) => void;
}

function ensureConfig(configs: Record<string, QuotationLayoutConfig>, key: string): QuotationLayoutConfig {
  return configs[key] ?? {
    colWidths: { ...DEFAULT_COL_WIDTHS },
    draftWidths: { ...DEFAULT_COL_WIDTHS },
    rowHeight: "normal",
    autoDetectGridSize: true,
    productSelectMode: "autocomplete" as ProductSelectMode,
    newRowTriggerCol: "lineTotal" as NewRowTriggerCol,
    header: { ...DEFAULT_SECTION },
    footer: { ...DEFAULT_SECTION },
  };
}

export const useQuotationLayoutStore = create<QuotationLayoutStore>()((set, get) => ({
  configs: {},

  getConfig: (key) => get().configs[key] ?? {
    colWidths: { ...DEFAULT_COL_WIDTHS },
    draftWidths: { ...DEFAULT_COL_WIDTHS },
    rowHeight: "normal",
    autoDetectGridSize: true,
    productSelectMode: "autocomplete" as ProductSelectMode,
    newRowTriggerCol: "lineTotal" as NewRowTriggerCol,
    header: { ...DEFAULT_SECTION },
    footer: { ...DEFAULT_SECTION },
  },

  setDraftWidth: (key, col, value) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return {
        configs: {
          ...s.configs,
          [key]: { ...cfg, draftWidths: { ...cfg.draftWidths, [col]: Math.max(50, Math.min(400, value)) } },
        },
      };
    }),

  applyDraftWidths: (key) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return {
        configs: { ...s.configs, [key]: { ...cfg, colWidths: { ...cfg.draftWidths } } },
      };
    }),

  resetDraftWidths: (key) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return {
        configs: {
          ...s.configs,
          [key]: { ...cfg, draftWidths: { ...DEFAULT_COL_WIDTHS }, colWidths: { ...DEFAULT_COL_WIDTHS } },
        },
      };
    }),

  setRowHeight: (key, height) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, rowHeight: height } } };
    }),

  setAutoDetectGridSize: (key, enabled) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, autoDetectGridSize: enabled } } };
    }),

  setProductSelectMode: (key, mode) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, productSelectMode: mode } } };
    }),

  setNewRowTriggerCol: (key, col) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, newRowTriggerCol: col } } };
    }),

  setHeaderConfig: (key, partial) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, header: { ...cfg.header, ...partial } } } };
    }),

  setFooterConfig: (key, partial) =>
    set((s) => {
      const cfg = ensureConfig(s.configs, key);
      return { configs: { ...s.configs, [key]: { ...cfg, footer: { ...cfg.footer, ...partial } } } };
    }),

  removeConfig: (key) =>
    set((s) => {
      const rest = { ...s.configs };
      delete rest[key];
      return { configs: rest };
    }),
}));
