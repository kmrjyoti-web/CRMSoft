'use client';

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import {
  useQuotationLayoutStore,
  COL_DEFS,
  ROW_HEIGHT_PX,
  type RowHeight,
  type ProductSelectMode,
  type NewRowTriggerCol,
} from "@/stores/quotation-layout.store";

interface Props { configKey: string; }

const NEW_ROW_TRIGGER_OPTIONS: { value: NewRowTriggerCol; label: string; desc: string }[] = [
  { value: "product",   label: "Product",    desc: "Tab after selecting a product" },
  { value: "qty",       label: "Qty",        desc: "Tab after entering quantity" },
  { value: "unit",      label: "Unit",       desc: "Tab after choosing unit" },
  { value: "unitPrice", label: "Rate",       desc: "Tab after entering rate" },
  { value: "discount",  label: "Discount",   desc: "Tab after entering discount" },
  { value: "gst",       label: "GST %",      desc: "Tab after choosing GST rate" },
  { value: "lineTotal", label: "Amount",     desc: "Tab on last column (default)" },
];

const ROW_HEIGHT_OPTIONS: { value: RowHeight; label: string; desc: string }[] = [
  { value: "compact",      label: "Compact",      desc: "32px — more rows visible" },
  { value: "normal",       label: "Normal",        desc: "40px — default" },
  { value: "comfortable",  label: "Comfortable",   desc: "52px — easier to read" },
];

// Approximate fixed chrome heights (toolbar, header labels, summary section, form fields)
const CHROME_PX = 240;

export function GridConfigTab({ configKey }: Props) {
  const cfg               = useQuotationLayoutStore((s) => s.getConfig(configKey));
  const setDraft          = useQuotationLayoutStore((s) => s.setDraftWidth);
  const applyDraft        = useQuotationLayoutStore((s) => s.applyDraftWidths);
  const resetDraft        = useQuotationLayoutStore((s) => s.resetDraftWidths);
  const setRowH           = useQuotationLayoutStore((s) => s.setRowHeight);
  const setAuto           = useQuotationLayoutStore((s) => s.setAutoDetectGridSize);
  const setProductMode    = useQuotationLayoutStore((s) => s.setProductSelectMode);
  const setNewRowTrigger  = useQuotationLayoutStore((s) => s.setNewRowTriggerCol);

  const [viewportH, setViewportH] = useState(typeof window !== "undefined" ? window.innerHeight : 800);

  useEffect(() => {
    const handler = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const headerPx = cfg.header.mode === "auto" && cfg.header.detectedPx != null
    ? cfg.header.detectedPx : cfg.header.fixedPx;
  const footerPx = cfg.footer.mode === "auto" && cfg.footer.detectedPx != null
    ? cfg.footer.detectedPx : cfg.footer.fixedPx;
  const rowPx    = ROW_HEIGHT_PX[cfg.rowHeight];
  const availPx  = Math.max(0, viewportH - headerPx - footerPx - CHROME_PX);
  const rowCount = Math.max(0, Math.floor(availPx / rowPx));

  return (
    <div className="space-y-5 p-1">

      {/* ── Column Widths ── */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Column Widths</p>
          <button
            type="button"
            className="text-xs text-red-500 hover:underline"
            onClick={() => resetDraft(configKey)}
          >
            Reset defaults
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
              <th className="pb-1.5 text-left">Column</th>
              <th className="pb-1.5 text-center">Width (px)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {COL_DEFS.map(({ key, label }) => {
              const val = cfg.draftWidths[key];
              return (
                <tr key={key}>
                  <td className="py-1.5 text-gray-600">{label}</td>
                  <td className="py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold"
                        onClick={() => setDraft(configKey, key, val - 10)}
                      >−</button>
                      <input
                        type="number"
                        className="w-16 rounded border border-gray-300 px-1 py-1 text-center text-sm"
                        value={val}
                        min={50}
                        max={400}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          if (!isNaN(n)) setDraft(configKey, key, n);
                        }}
                      />
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold"
                        onClick={() => setDraft(configKey, key, val + 10)}
                      >+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          type="button"
          className="mt-2 w-full rounded bg-[var(--color-primary)] py-1.5 text-xs font-semibold text-white hover:opacity-90"
          onClick={() => applyDraft(configKey)}
        >
          Apply Column Widths
        </button>
      </section>

      {/* ── Row Height ── */}
      <section>
        <p className="mb-2 text-sm font-semibold text-gray-700">Row Height</p>
        <div className="space-y-1.5">
          {ROW_HEIGHT_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRowH(configKey, value)}
              className={[
                "w-full rounded-md border px-3 py-2 text-left transition-colors",
                cfg.rowHeight === value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                {cfg.rowHeight === value && <Icon name="check" size={14} />}
              </div>
              <span className="text-xs opacity-60">{desc}</span>
              {/* Mini row preview */}
              <div
                className="mt-1.5 rounded border border-gray-200 bg-gray-50"
                style={{ height: ROW_HEIGHT_PX[value] }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ── Product Selection Mode ── */}
      <section>
        <p className="mb-2 text-sm font-semibold text-gray-700">Product Selection Mode</p>
        <div className="flex gap-2">
          {(["autocomplete", "popup"] as ProductSelectMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setProductMode(configKey, mode)}
              className={[
                "flex-1 rounded-md border px-3 py-2.5 text-left transition-colors",
                cfg.productSelectMode === mode
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon name={mode === "popup" ? "layout-grid" : "search"} size={14} />
                {cfg.productSelectMode === mode && <Icon name="check" size={13} />}
              </div>
              <p className="text-sm font-medium capitalize">{mode}</p>
              <p className="text-xs opacity-60 mt-0.5">
                {mode === "autocomplete" ? "Type to search inline" : "Opens full item picker popup"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── New Row Trigger ── */}
      <section>
        <p className="mb-1 text-sm font-semibold text-gray-700">New Row Trigger (Tab key)</p>
        <p className="mb-2 text-xs text-gray-400">
          Pressing Tab on the last row in this column automatically adds a new row and focuses the Product field.
        </p>
        <div className="space-y-1">
          {NEW_ROW_TRIGGER_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setNewRowTrigger(configKey, value)}
              className={[
                "w-full rounded-md border px-3 py-2 text-left transition-colors flex items-center justify-between",
                cfg.newRowTriggerCol === value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                  : "border-gray-200 hover:border-gray-300 text-gray-600",
              ].join(" ")}
            >
              <div>
                <span className="text-sm font-medium">{label}</span>
                <span className="ml-2 text-xs opacity-60">{desc}</span>
              </div>
              {cfg.newRowTriggerCol === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      </section>

      {/* ── Auto Grid Size ── */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Auto-fit Grid to Viewport</p>
            <p className="text-xs text-gray-400">Fills available space with blank rows</p>
          </div>
          <Switch
            checked={cfg.autoDetectGridSize}
            onChange={(checked) => setAuto(configKey, checked)}
          />
        </div>

        {cfg.autoDetectGridSize && (
          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Viewport</span><span className="font-medium text-gray-700">{viewportH}px</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>− Header</span><span>{headerPx}px</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>− Footer</span><span>{footerPx}px</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>− Chrome</span><span>~{CHROME_PX}px</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-700">
              <span>= Available</span><span>{availPx}px</span>
            </div>
            <div className="flex justify-between text-[var(--color-primary)] font-semibold pt-0.5">
              <span>→ Blank rows</span>
              <span>{rowCount} × {rowPx}px ({cfg.rowHeight})</span>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
