/**
 * ListCheckbox state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular list-checkbox.component.ts — exact port.
 */

import type {
  ListCheckboxState,
  ListCheckboxOption,
} from "./list-checkbox.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface ListCheckboxInternalState {
  isFocused: boolean;
  selectedValues: (string | number | boolean)[];
  searchQuery: string;
}

export const initialListCheckboxState: ListCheckboxInternalState = {
  isFocused: false,
  selectedValues: [],
  searchQuery: "",
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type ListCheckboxAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "TOGGLE_OPTION"; value: string | number | boolean }
  | { type: "REMOVE_OPTION"; value: string | number | boolean }
  | { type: "CLEAR" }
  | { type: "SET_VALUES"; values: (string | number | boolean)[] }
  | { type: "SEARCH"; query: string };

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveListCheckboxStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveListCheckboxState(
  props: ResolveListCheckboxStateProps,
  internalState: ListCheckboxInternalState,
): ListCheckboxState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

export function filterListCheckboxOptions(
  options: ListCheckboxOption[],
  query: string,
): ListCheckboxOption[] {
  if (!query.trim()) return options;
  const term = query.toLowerCase().trim();
  return options.filter((opt) => opt.label.toLowerCase().includes(term));
}

// ---------------------------------------------------------------------------
// Get selected option details — port of Angular selectedOptionDetails
// ---------------------------------------------------------------------------

export function getSelectedOptionDetails(
  selectedValues: (string | number | boolean)[],
  options: ListCheckboxOption[],
): ListCheckboxOption[] {
  return options.filter((opt) => selectedValues.includes(opt.value));
}

// ---------------------------------------------------------------------------
// Get visible chips — port of Angular visibleSelectedOptions
// ---------------------------------------------------------------------------

export function getVisibleChips(
  selectedValues: (string | number | boolean)[],
  options: ListCheckboxOption[],
  maxChips: number,
): ListCheckboxOption[] {
  return getSelectedOptionDetails(selectedValues, options).slice(0, maxChips);
}

// ---------------------------------------------------------------------------
// Get remaining count — port of Angular remainingCount
// ---------------------------------------------------------------------------

export function getRemainingCount(
  selectedValues: (string | number | boolean)[],
  options: ListCheckboxOption[],
  maxChips: number,
): number {
  const total = getSelectedOptionDetails(selectedValues, options).length;
  return Math.max(0, total - maxChips);
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function listCheckboxReducer(
  state: ListCheckboxInternalState,
  action: ListCheckboxAction,
): ListCheckboxInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true };

    case "BLUR":
      return { ...state, isFocused: false };

    case "TOGGLE_OPTION": {
      const isSelected = state.selectedValues.includes(action.value);
      if (isSelected) {
        return {
          ...state,
          selectedValues: state.selectedValues.filter(
            (v) => v !== action.value,
          ),
        };
      }
      return {
        ...state,
        selectedValues: [...state.selectedValues, action.value],
      };
    }

    case "REMOVE_OPTION":
      return {
        ...state,
        selectedValues: state.selectedValues.filter(
          (v) => v !== action.value,
        ),
      };

    case "CLEAR":
      return { ...state, selectedValues: [] };

    case "SET_VALUES":
      return { ...state, selectedValues: action.values };

    case "SEARCH":
      return { ...state, searchQuery: action.query };

    default:
      return state;
  }
}
