/**
 * React AICSlider component.
 * Range slider with min/max/step, dual handles, tick marks, labels.
 * Source: Angular slider.component.ts
 */

import React, { useCallback, useRef, useState } from "react";
import {
  cn,
  sliderPercentage,
  generateTicks,
  valueFromPosition,
} from "@coreui/ui";
import type { SliderOrientation } from "@coreui/ui";

export interface SliderProps {
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  orientation?: SliderOrientation;
  disabled?: boolean;
  label?: string;
  trackColor?: string;
  className?: string;
  onChange?: (value: number | [number, number]) => void;
}

export const AICSlider = React.forwardRef<HTMLDivElement, SliderProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      range = false,
      showTicks = false,
      showLabels = true,
      orientation = "horizontal",
      disabled = false,
      label,
      trackColor,
      className,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? controlledValue : internalValue;
    const trackRef = useRef<HTMLDivElement>(null);
    const isVertical = orientation === "vertical";
    const ticks = showTicks ? generateTicks(min, max, step) : [];

    const singleValue = typeof currentValue === "number"
      ? currentValue
      : currentValue[0];
    const rangeValues: [number, number] = range
      ? (typeof currentValue === "number" ? [currentValue, max] : currentValue as [number, number])
      : [singleValue, singleValue];

    const pctLow = sliderPercentage(rangeValues[0], min, max);
    const pctHigh = range ? sliderPercentage(rangeValues[1], min, max) : pctLow;

    const commitValue = useCallback(
      (val: number | [number, number]) => {
        if (disabled) return;
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
      },
      [disabled, isControlled, onChange],
    );

    const handleTrackClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const offset = isVertical
          ? rect.bottom - e.clientY
          : e.clientX - rect.left;
        const size = isVertical ? rect.height : rect.width;
        const val = valueFromPosition(offset, size, min, max, step);

        if (range) {
          const distLow = Math.abs(val - rangeValues[0]);
          const distHigh = Math.abs(val - rangeValues[1]);
          if (distLow <= distHigh) {
            commitValue([val, rangeValues[1]]);
          } else {
            commitValue([rangeValues[0], val]);
          }
        } else {
          commitValue(val);
        }
      },
      [disabled, isVertical, min, max, step, range, rangeValues, commitValue],
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, handleIndex?: number) => {
        const val = Number(e.target.value);
        if (range && handleIndex !== undefined) {
          const newRange: [number, number] = [...rangeValues] as [number, number];
          newRange[handleIndex] = val;
          commitValue(newRange);
        } else {
          commitValue(val);
        }
      },
      [range, rangeValues, commitValue],
    );

    const displayValue = range
      ? `${rangeValues[0]} - ${rangeValues[1]}`
      : String(singleValue);

    return (
      <div
        className={cn(
          "relative",
          isVertical && "h-48 flex flex-col items-center",
          className,
        )}
        ref={ref}
        data-testid="slider"
      >
        {label && (
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-[var(--color-text)]">
              {label}
            </label>
            <span
              className="text-sm font-bold text-[var(--color-border-focus)]"
              data-testid="slider-value"
            >
              {displayValue}
            </span>
          </div>
        )}

        <div
          className={cn(
            "relative flex items-center",
            isVertical ? "flex-col h-full w-6" : "h-6 w-full",
          )}
        >
          {/* Track background */}
          <div
            ref={trackRef}
            className={cn(
              "absolute bg-gray-200 rounded-lg overflow-hidden cursor-pointer",
              isVertical ? "w-2 h-full" : "w-full h-2",
            )}
            onClick={handleTrackClick}
            data-testid="slider-track"
          >
            {/* Active fill */}
            <div
              className="absolute bg-[var(--color-border-focus)] transition-all duration-100 ease-out rounded-lg"
              style={{
                ...(isVertical
                  ? { bottom: `${pctLow}%`, height: `${pctHigh - pctLow}%`, width: "100%" }
                  : { left: range ? `${pctLow}%` : "0%", width: range ? `${pctHigh - pctLow}%` : `${pctLow}%`, height: "100%" }),
                ...(trackColor ? { backgroundColor: trackColor } : {}),
              }}
              data-testid="slider-fill"
            />
          </div>

          {/* Native range input (single mode) */}
          {!range && (
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={singleValue}
              onChange={(e) => handleInputChange(e)}
              disabled={disabled}
              className={cn(
                "absolute opacity-0 cursor-pointer z-10",
                isVertical ? "h-full w-6 appearance-slider-vertical" : "w-full h-2",
              )}
              data-testid="slider-input"
            />
          )}

          {/* Range mode: two inputs */}
          {range && (
            <>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={rangeValues[0]}
                onChange={(e) => handleInputChange(e, 0)}
                disabled={disabled}
                className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
                data-testid="slider-input-low"
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={rangeValues[1]}
                onChange={(e) => handleInputChange(e, 1)}
                disabled={disabled}
                className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
                data-testid="slider-input-high"
              />
            </>
          )}

          {/* Custom thumb (single) */}
          {!range && (
            <div
              className="absolute h-5 w-5 bg-white border-2 border-[var(--color-border-focus)] rounded-full shadow pointer-events-none transition-all duration-100 ease-out"
              style={{
                ...(isVertical
                  ? { bottom: `${pctLow}%`, transform: "translateY(50%)" }
                  : { left: `${pctLow}%`, transform: "translateX(-50%)" }),
              }}
              data-testid="slider-thumb"
            />
          )}

          {/* Custom thumbs (range) */}
          {range && (
            <>
              <div
                className="absolute h-5 w-5 bg-white border-2 border-[var(--color-border-focus)] rounded-full shadow pointer-events-none transition-all"
                style={{ left: `${pctLow}%`, transform: "translateX(-50%)" }}
                data-testid="slider-thumb-low"
              />
              <div
                className="absolute h-5 w-5 bg-white border-2 border-[var(--color-border-focus)] rounded-full shadow pointer-events-none transition-all"
                style={{ left: `${pctHigh}%`, transform: "translateX(-50%)" }}
                data-testid="slider-thumb-high"
              />
            </>
          )}

          {/* Tick marks */}
          {showTicks && ticks.map((pct, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-400 rounded-full pointer-events-none"
              style={isVertical ? { bottom: `${pct}%` } : { left: `${pct}%` }}
              data-testid="slider-tick"
            />
          ))}
        </div>

        {showLabels && (
          <div className={cn(
            "flex justify-between text-xs text-[var(--color-text-tertiary)] mt-1",
            isVertical && "flex-col-reverse h-full",
          )}>
            <span data-testid="slider-min-label">{min}</span>
            <span data-testid="slider-max-label">{max}</span>
          </div>
        )}
      </div>
    );
  },
);

AICSlider.displayName = "AICSlider";
