'use client';

import { Switch, NumberInput } from "@/components/ui";
import { useQuotationLayoutStore } from "@/stores/quotation-layout.store";

interface Props { configKey: string; }

export function HeaderConfigTab({ configKey }: Props) {
  const cfg = useQuotationLayoutStore((s) => s.getConfig(configKey));
  const setHeaderConfig = useQuotationLayoutStore((s) => s.setHeaderConfig);
  const { header } = cfg;

  const effectivePx = header.mode === "auto" && header.detectedPx != null
    ? header.detectedPx
    : header.fixedPx;

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Auto-detect Height</p>
          <p className="text-xs text-gray-400">Measures the rendered header automatically</p>
        </div>
        <Switch
          checked={header.mode === "auto"}
          onChange={(checked) => setHeaderConfig(configKey, { mode: checked ? "auto" : "fixed" })}
        />
      </div>

      {header.mode === "fixed" ? (
        <NumberInput
          label="Header Height (px)"
          value={header.fixedPx}
          onChange={(v) => setHeaderConfig(configKey, { fixedPx: v ?? 56 })}
          min={40}
          max={400}
          step={1}
          precision={0}
        />
      ) : (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-600">
          {header.detectedPx != null
            ? `Auto-detected: ${header.detectedPx}px`
            : "Waiting for measurement…"}
        </div>
      )}

      {/* Visual preview bar */}
      <div>
        <p className="mb-1 text-xs text-gray-400">Preview</p>
        <div
          className="w-full rounded border border-dashed border-blue-300 bg-blue-50 transition-all"
          style={{ height: effectivePx }}
        >
          <div className="flex h-full items-center justify-center text-xs text-blue-400">
            Header — {effectivePx}px
          </div>
        </div>
      </div>
    </div>
  );
}
