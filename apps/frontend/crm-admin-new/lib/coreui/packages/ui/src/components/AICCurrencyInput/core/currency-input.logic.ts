/**
 * CurrencyInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular currency-input.component.ts — exact port + locale & min/max enhancements.
 */

import type {
  CurrencyInputState,
  CurrencyLocale,
  CurrencyOption,
} from "./currency-input.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface CurrencyInputInternalState {
  isFocused: boolean;
  value: number | null;
  displayValue: string;
  selectedCurrency: CurrencyOption | null;
}

export const initialCurrencyInputState: CurrencyInputInternalState = {
  isFocused: false,
  value: null,
  displayValue: "",
  selectedCurrency: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type CurrencyInputAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT"; rawInput: string }
  | { type: "SET_VALUE"; value: number | null }
  | { type: "SELECT_CURRENCY"; currency: CurrencyOption }
  | { type: "CLEAR" };

// ---------------------------------------------------------------------------
// Reducer config
// ---------------------------------------------------------------------------

export interface CurrencyInputReducerConfig {
  locale: CurrencyLocale;
  decimals: number;
  min?: number;
  max?: number;
}

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveCurrencyInputStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveCurrencyInputState(
  props: ResolveCurrencyInputStateProps,
  internalState: CurrencyInputInternalState,
): CurrencyInputState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Format currency — exact port of Angular updateDisplay(), enhanced with locale
// ---------------------------------------------------------------------------

/**
 * Formats a number for display with locale-aware grouping and decimal places.
 * - `en-IN`: 1,00,000.00
 * - `en-US`: 100,000.00
 */
export function formatCurrency(
  value: number | null,
  locale: CurrencyLocale,
  decimals: number,
): string {
  if (value === null || value === undefined) return "";

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    }).format(num);
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// Parse currency input — exact port of Angular handleInput()
// ---------------------------------------------------------------------------

/**
 * Parses user input by stripping commas and spaces, returns the number or null.
 * Allows partial input (-, .) to continue typing.
 */
export function parseCurrencyInput(
  raw: string,
): { value: number | null; isPartial: boolean } {
  // Remove commas and spaces — exact match of Angular: raw.replace(/,/g, '').replace(/\s/g, '')
  const clean = raw.replace(/,/g, "").replace(/\s/g, "");

  // Empty
  if (clean === "") {
    return { value: null, isPartial: false };
  }

  // Partial number (typing in progress)
  if (clean === "-" || clean === "." || clean === "-.") {
    return { value: null, isPartial: true };
  }

  const num = parseFloat(clean);
  if (Number.isNaN(num)) {
    return { value: null, isPartial: true };
  }

  return { value: num, isPartial: false };
}

// ---------------------------------------------------------------------------
// Clamp value to min/max
// ---------------------------------------------------------------------------

export function clampCurrency(
  value: number,
  min?: number,
  max?: number,
): number {
  let result = value;
  if (typeof min === "number") result = Math.max(min, result);
  if (typeof max === "number") result = Math.min(max, result);
  return result;
}

// ---------------------------------------------------------------------------
// Validate min/max — returns error message or null
// ---------------------------------------------------------------------------

export function validateCurrencyRange(
  value: number | null,
  min?: number,
  max?: number,
): string | null {
  if (value === null) return null;
  if (typeof min === "number" && value < min) {
    return `Value must be at least ${min}`;
  }
  if (typeof max === "number" && value > max) {
    return `Value must be at most ${max}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function currencyInputReducer(
  state: CurrencyInputInternalState,
  action: CurrencyInputAction,
  config: CurrencyInputReducerConfig,
): CurrencyInputInternalState {
  switch (action.type) {
    case "FOCUS": {
      // On focus: show raw number for editing — exact port of Angular onFocus()
      const rawDisplay =
        state.value !== null ? String(state.value) : "";
      return { ...state, isFocused: true, displayValue: rawDisplay };
    }
    case "BLUR": {
      // On blur: show formatted — exact port of Angular onBlur()
      const formatted = formatCurrency(
        state.value,
        config.locale,
        config.decimals,
      );
      return { ...state, isFocused: false, displayValue: formatted };
    }
    case "INPUT": {
      const { value, isPartial } = parseCurrencyInput(action.rawInput);

      if (isPartial) {
        // Allow partial input without updating the numeric value
        return { ...state, displayValue: action.rawInput };
      }

      return { ...state, value, displayValue: action.rawInput };
    }
    case "SET_VALUE": {
      const formatted = state.isFocused
        ? action.value !== null
          ? String(action.value)
          : ""
        : formatCurrency(action.value, config.locale, config.decimals);
      return { ...state, value: action.value, displayValue: formatted };
    }
    case "SELECT_CURRENCY": {
      return { ...state, selectedCurrency: action.currency };
    }
    case "CLEAR": {
      return { ...state, value: null, displayValue: "" };
    }
    default:
      return state;
  }
}
