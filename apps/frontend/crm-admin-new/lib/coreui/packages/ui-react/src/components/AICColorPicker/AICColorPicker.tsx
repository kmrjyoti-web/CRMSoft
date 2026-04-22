/**
 * React AICColorPicker component.
 * Color swatch grid, hex input with validation, RGB sliders,
 * recent colors list, custom palette support, color preview box.
 *
 * Source: Angular color-picker.component.ts
 */

import React, { useCallback, useState, useMemo } from "react";
import {
  cn,
  isValidHex,
  safeColor,
  hexToRgb,
  rgbToHex,
  addRecentColor,
  DEFAULT_PALETTE,
  GLOBAL_UI_CONFIG,
} from "@coreui/ui";
import type { RgbColor } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  palette?: string[];
  maxRecentColors?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
  onChange?: (color: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = "#000000",
      palette = DEFAULT_PALETTE,
      maxRecentColors = 10,
      disabled = false,
      label,
      className,
      id,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? controlledValue : internalValue;

    const [hexInput, setHexInput] = useState(
      safeColor(currentValue).replace(/^#/, ""),
    );
    const [hexError, setHexError] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);

    const currentSafe = safeColor(currentValue);

    const rgb: RgbColor = useMemo(
      () => hexToRgb(currentSafe) ?? { r: 0, g: 0, b: 0 },
      [currentSafe],
    );

    // ── Commit a new color ──────────────────────────────────
    const commitColor = useCallback(
      (hex: string) => {
        if (disabled) return;
        const safe = safeColor(hex);
        if (!isControlled) {
          setInternalValue(safe);
        }
        setHexInput(safe.replace(/^#/, ""));
        setHexError(false);
        setRecentColors((prev) => addRecentColor(prev, safe, maxRecentColors));
        onChange?.(safe);
      },
      [disabled, isControlled, maxRecentColors, onChange],
    );

    // ── Swatch click ────────────────────────────────────────
    const handleSwatchClick = useCallback(
      (color: string) => {
        commitColor(color);
      },
      [commitColor],
    );

    // ── Hex input ───────────────────────────────────────────
    const handleHexChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setHexInput(raw);
        const withHash = raw.startsWith("#") ? raw : `#${raw}`;
        if (isValidHex(withHash)) {
          setHexError(false);
          commitColor(withHash);
        } else {
          setHexError(true);
        }
      },
      [commitColor],
    );

    // ── RGB sliders ─────────────────────────────────────────
    const handleRgbChange = useCallback(
      (channel: keyof RgbColor, val: number) => {
        const updated = { ...rgb, [channel]: val };
        const hex = rgbToHex(updated.r, updated.g, updated.b);
        commitColor(hex);
      },
      [rgb, commitColor],
    );

    // ── Native color picker ─────────────────────────────────
    const handleNativeColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        commitColor(e.target.value);
      },
      [commitColor],
    );

    return (
      <div
        className={cn("relative", className)}
        ref={ref}
        data-testid="color-picker"
      >
        {label && (
          <label
            className="block text-sm font-medium text-[var(--color-text)] mb-2"
            htmlFor={id}
          >
            {label}
          </label>
        )}

        {/* ── Color preview + Hex input row ──────────────── */}
        <div className="relative flex items-center gap-3 mb-3">
          {/* Color preview box (Angular: colorPreview + native input overlay) */}
          <div
            className={GLOBAL_UI_CONFIG.colorPreview}
            style={{ backgroundColor: currentSafe }}
            data-testid="color-preview"
          >
            <input
              type="color"
              value={currentSafe}
              onChange={handleNativeColorChange}
              disabled={disabled}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer p-0 border-0"
              tabIndex={-1}
              aria-label="Color picker"
            />
          </div>

          {/* Hex text input (Angular: # prefix + text input) */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-sm font-bold text-[var(--color-text-tertiary)]">
                #
              </span>
            </div>
            <input
              type="text"
              id={id}
              value={hexInput}
              onChange={handleHexChange}
              disabled={disabled}
              maxLength={7}
              placeholder="000000"
              className={cn(
                "w-full pl-7 pr-3 py-2 text-sm border rounded-lg transition-all",
                "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)] focus:border-[var(--color-border-focus)]",
                hexError &&
                  "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              data-testid="color-hex-input"
            />
          </div>
        </div>

        {/* ── RGB Sliders ────────────────────────────────── */}
        <div className="space-y-2 mb-3" data-testid="color-rgb-sliders">
          {(["r", "g", "b"] as const).map((channel) => (
            <div key={channel} className="flex items-center gap-2">
              <span className="w-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase">
                {channel}
              </span>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) =>
                  handleRgbChange(channel, parseInt(e.target.value, 10))
                }
                disabled={disabled}
                className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--color-border-focus)]"
                data-testid={`color-slider-${channel}`}
              />
              <span
                className="w-8 text-xs text-right text-[var(--color-text-tertiary)] tabular-nums"
                data-testid={`color-value-${channel}`}
              >
                {rgb[channel]}
              </span>
            </div>
          ))}
        </div>

        {/* ── Palette swatches ───────────────────────────── */}
        {palette.length > 0 && (
          <div
            className="grid grid-cols-10 gap-1 mb-3"
            data-testid="color-palette"
          >
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer transition-all hover:scale-110 hover:shadow-sm",
                  currentSafe.toLowerCase() === color.toLowerCase() &&
                    "ring-2 ring-[var(--color-border-focus)] ring-offset-1",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleSwatchClick(color)}
                disabled={disabled}
                aria-label={`AICSelect color ${color}`}
                data-testid={`color-swatch-${color.replace("#", "")}`}
              />
            ))}
          </div>
        )}

        {/* ── Recent colors ──────────────────────────────── */}
        {recentColors.length > 0 && (
          <div data-testid="color-recent">
            <span className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
              Recent
            </span>
            <div className="flex gap-1 flex-wrap">
              {recentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-6 h-6 rounded border border-[var(--color-border)] cursor-pointer transition-all hover:scale-110",
                    currentSafe.toLowerCase() === color.toLowerCase() &&
                      "ring-2 ring-[var(--color-border-focus)] ring-offset-1",
                    disabled && "opacity-50 cursor-not-allowed",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleSwatchClick(color)}
                  disabled={disabled}
                  aria-label={`Recent color ${color}`}
                  data-testid={`color-recent-${color.replace("#", "")}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hex validation error */}
        {hexError && (
          <div
            className="text-xs text-[var(--color-danger)] mt-1"
            role="alert"
            data-testid="color-hex-error"
          >
            Invalid hex color. Use format: RRGGBB
          </div>
        )}
      </div>
    );
  },
);

AICColorPicker.displayName = "AICColorPicker";
