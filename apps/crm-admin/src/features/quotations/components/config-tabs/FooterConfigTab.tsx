'use client';

import { Switch, NumberInput } from "@/components/ui";
import { useQuotationLayoutStore } from "@/stores/quotation-layout.store";

interface Props { configKey: string; }

export function FooterConfigTab({ configKey }: Props) {
  const cfg = useQuotationLayoutStore((s) => s.getConfig(configKey));
  const setFooterConfig = useQuotationLayoutStore((s) => s.setFooterConfig);
  const { footer } = cfg;

  const effectivePx = footer.mode === "auto" && footer.detectedPx != null
    ? footer.detectedPx
    : footer.fixedPx;

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Auto-detect Height</p>
          <p className="text-xs text-gray-400">Measures the rendered footer automatically</p>
        </div>
        <Switch
          checked={footer.mode === "auto"}
          onChange={(checked) => setFooterConfig(configKey, { mode: checked ? "auto" : "fixed" })}
        />
      </div>

      {footer.mode === "fixed" ? (
        <NumberInput
          label="Footer Height (px)"
          value={footer.fixedPx}
          onChange={(v) => setFooterConfig(configKey, { fixedPx: v ?? 56 })}
          min={40}
          max={400}
          step={1}
          precision={0}
        />
      ) : (
        <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-600">
          {footer.detectedPx != null
            ? `Auto-detected: ${footer.detectedPx}px`
            : "Waiting for measurement…"}
        </div>
      )}

      {/* Visual preview bar */}
      <div>
        <p className="mb-1 text-xs text-gray-400">Preview</p>
        <div
          className="w-full rounded border border-dashed border-green-300 bg-green-50 transition-all"
          style={{ height: effectivePx }}
        >
          <div className="flex h-full items-center justify-center text-xs text-green-400">
            Footer — {effectivePx}px
          </div>
        </div>
      </div>
    </div>
  );
}
