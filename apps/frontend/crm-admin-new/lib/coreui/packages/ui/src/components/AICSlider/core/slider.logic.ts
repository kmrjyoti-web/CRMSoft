/**
 * Slider state logic and pure helper functions.
 * Framework-agnostic.
 * Source: Angular slider.component.ts
 */

/** Calculate percentage position on track. */
export function sliderPercentage(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) * 100) / (max - min);
}

/** Snap a value to the nearest step. */
export function snapToStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min;
}

/** Clamp value between min and max. */
export function clampSliderValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Generate tick positions as percentages. */
export function generateTicks(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) {
    ticks.push(sliderPercentage(v, min, max));
  }
  return ticks;
}

/** Calculate value from mouse position on track. */
export function valueFromPosition(
  offset: number,
  trackSize: number,
  min: number,
  max: number,
  step: number,
): number {
  const ratio = Math.max(0, Math.min(1, offset / trackSize));
  const raw = min + ratio * (max - min);
  return clampSliderValue(snapToStep(raw, min, step), min, max);
}
