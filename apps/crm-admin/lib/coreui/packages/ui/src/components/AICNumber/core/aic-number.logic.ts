/**
 * AICNumber state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-number.component.ts
 */

import type {
  AICNumberState,
  SpinnerLayout,
  SpinnerButton,
  NumberLocale,
} from "./aic-number.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type AICNumberAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "CHANGE"; value: number | null }
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "CLEAR" };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface AICNumberInternalState {
  isFocused: boolean;
  value: number | null;
}

export const initialAICNumberState: AICNumberInternalState = {
  isFocused: false,
  value: null,
};

// ---------------------------------------------------------------------------
// Normalize — exact port of Angular AICNumberComponent.normalize()
// ---------------------------------------------------------------------------

export interface NormalizeConfig {
  min?: number;
  max?: number;
  precision: number;
}

/**
 * Clamps value to min/max range and applies decimal precision.
 * Matches Angular implementation exactly.
 */
export function normalize(value: number, config: NormalizeConfig): number {
  let next = value;

  if (typeof config.min === "number") next = Math.max(config.min, next);
  if (typeof config.max === "number") next = Math.min(config.max, next);

  const precision = Number.isFinite(config.precision)
    ? Math.max(0, config.precision)
    : 0;
  if (precision > 0) {
    const factor = 10 ** precision;
    next = Math.round(next * factor) / factor;
  } else {
    next = Math.round(next);
  }

  return next;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export interface AICNumberReducerConfig {
  step: number;
  min?: number;
  max?: number;
  precision: number;
}

export function aicNumberReducer(
  state: AICNumberInternalState,
  action: AICNumberAction,
  config: AICNumberReducerConfig,
): AICNumberInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true };
    case "BLUR":
      return { ...state, isFocused: false };
    case "CHANGE":
      return { ...state, value: action.value };
    case "INCREMENT": {
      const start = state.value ?? 0;
      const next = normalize(start + config.step, config);
      return { ...state, value: next };
    }
    case "DECREMENT": {
      const start = state.value ?? 0;
      const next = normalize(start - config.step, config);
      return { ...state, value: next };
    }
    case "CLEAR":
      return { ...state, value: null };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveAICNumberStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveAICNumberState(
  props: ResolveAICNumberStateProps,
  internalState: AICNumberInternalState,
): AICNumberState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Spinner button descriptors — exact port of Angular leftButtons/rightButtons
// ---------------------------------------------------------------------------

export function getLeftButtons(
  layout: SpinnerLayout,
  showSpinner: boolean,
): SpinnerButton[] {
  if (!showSpinner) return [];
  if (layout === "left") {
    return [
      { action: "decrease", icon: "minus", label: "Decrease" },
      { action: "increase", icon: "plus", label: "Increase" },
    ];
  }
  if (layout === "split") {
    return [{ action: "decrease", icon: "minus", label: "Decrease" }];
  }
  if (layout === "split-reverse") {
    return [{ action: "increase", icon: "plus", label: "Increase" }];
  }
  return [];
}

export function getRightButtons(
  layout: SpinnerLayout,
  showSpinner: boolean,
): SpinnerButton[] {
  if (!showSpinner) return [];
  if (layout === "right") {
    return [
      { action: "decrease", icon: "minus", label: "Decrease" },
      { action: "increase", icon: "plus", label: "Increase" },
    ];
  }
  if (layout === "split") {
    return [{ action: "increase", icon: "plus", label: "Increase" }];
  }
  if (layout === "split-reverse") {
    return [{ action: "decrease", icon: "minus", label: "Decrease" }];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Number formatting (locale-aware)
// ---------------------------------------------------------------------------

/**
 * Formats a number for display according to locale.
 * - `en-IN`: 1,00,000
 * - `en-US`: 100,000
 */
export function formatNumber(
  value: number | null,
  locale: NumberLocale,
  precision: number,
): string {
  if (value === null) return "";
  try {
    return value.toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  } catch {
    return String(value);
  }
}

/**
 * Parses a locale-formatted string back to a number.
 * Strips group separators (commas, dots used as thousands) and handles
 * decimal separators.
 */
export function parseFormattedNumber(text: string): number | null {
  if (!text || text.trim() === "") return null;
  // Remove all characters except digits, minus, and period
  const cleaned = text.replace(/[^0-9.\-]/g, "");
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Can increment/decrement? (for disabling spinner buttons at boundaries)
// ---------------------------------------------------------------------------

export function canIncrement(
  value: number | null,
  step: number,
  max?: number,
): boolean {
  if (typeof max !== "number") return true;
  const next = (value ?? 0) + step;
  return next <= max;
}

export function canDecrement(
  value: number | null,
  step: number,
  min?: number,
): boolean {
  if (typeof min !== "number") return true;
  const next = (value ?? 0) - step;
  return next >= min;
}
