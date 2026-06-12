/**
 * MultiSelectInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular multi-select-input.component.ts — exact port.
 */

import type {
  MultiSelectState,
  MultiSelectOption,
} from "./multi-select-input.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface MultiSelectInternalState {
  isFocused: boolean;
  isOpen: boolean;
  selectedValues: (string | number | boolean)[];
  searchQuery: string;
  isLoading: boolean;
}

export const initialMultiSelectState: MultiSelectInternalState = {
  isFocused: false,
  isOpen: false,
  selectedValues: [],
  searchQuery: "",
  isLoading: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type MultiSelectAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "TOGGLE_DROPDOWN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE_OPTION"; value: string | number | boolean; maxSelection?: number }
  | { type: "REMOVE_OPTION"; value: string | number | boolean }
  | { type: "SELECT_ALL"; options: MultiSelectOption[]; maxSelection?: number }
  | { type: "DESELECT_ALL" }
  | { type: "SET_VALUES"; values: (string | number | boolean)[] }
  | { type: "SEARCH"; query: string }
  | { type: "SET_LOADING"; loading: boolean };

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveMultiSelectStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveMultiSelectState(
  props: ResolveMultiSelectStateProps,
  internalState: MultiSelectInternalState,
): MultiSelectState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused || internalState.isOpen) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

export function filterMultiSelectOptions(
  options: MultiSelectOption[],
  query: string,
): MultiSelectOption[] {
  if (!query.trim()) return options;
  const term = query.toLowerCase().trim();
  return options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(term) ||
      (opt.description && opt.description.toLowerCase().includes(term)),
  );
}

// ---------------------------------------------------------------------------
// Get display label — exact port of Angular getDisplayLabel()
// ---------------------------------------------------------------------------

export function getMultiSelectDisplayLabel(
  selectedValues: (string | number | boolean)[],
  options: MultiSelectOption[],
): string {
  if (selectedValues.length === 0) return "";
  if (selectedValues.length === 1) {
    const opt = options.find((o) => o.value === selectedValues[0]);
    return opt ? opt.label : String(selectedValues[0]);
  }
  return `${selectedValues.length} items selected`;
}

// ---------------------------------------------------------------------------
// Get selected options with their labels
// ---------------------------------------------------------------------------

export function getSelectedOptions(
  selectedValues: (string | number | boolean)[],
  options: MultiSelectOption[],
): MultiSelectOption[] {
  return options.filter((opt) => selectedValues.includes(opt.value));
}

// ---------------------------------------------------------------------------
// Check if can select more
// ---------------------------------------------------------------------------

export function canSelectMore(
  currentCount: number,
  maxSelection?: number,
): boolean {
  if (maxSelection === undefined || maxSelection <= 0) return true;
  return currentCount < maxSelection;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function multiSelectReducer(
  state: MultiSelectInternalState,
  action: MultiSelectAction,
): MultiSelectInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true };

    case "BLUR":
      return {
        ...state,
        isFocused: false,
        isOpen: false,
        searchQuery: "",
      };

    case "TOGGLE_DROPDOWN":
      return state.isOpen
        ? { ...state, isOpen: false, searchQuery: "" }
        : { ...state, isOpen: true, searchQuery: "" };

    case "CLOSE":
      return { ...state, isOpen: false, searchQuery: "" };

    case "TOGGLE_OPTION": {
      const { value, maxSelection } = action;
      const isSelected = state.selectedValues.includes(value);
      if (isSelected) {
        return {
          ...state,
          selectedValues: state.selectedValues.filter((v) => v !== value),
        };
      }
      // Check max limit
      if (!canSelectMore(state.selectedValues.length, maxSelection)) {
        return state;
      }
      return {
        ...state,
        selectedValues: [...state.selectedValues, value],
      };
    }

    case "REMOVE_OPTION":
      return {
        ...state,
        selectedValues: state.selectedValues.filter(
          (v) => v !== action.value,
        ),
      };

    case "SELECT_ALL": {
      const { options, maxSelection } = action;
      const enabledValues = options
        .filter((o) => !o.disabled)
        .map((o) => o.value);
      const limited =
        maxSelection && maxSelection > 0
          ? enabledValues.slice(0, maxSelection)
          : enabledValues;
      return { ...state, selectedValues: limited };
    }

    case "DESELECT_ALL":
      return { ...state, selectedValues: [] };

    case "SET_VALUES":
      return { ...state, selectedValues: action.values };

    case "SEARCH":
      return { ...state, searchQuery: action.query };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    default:
      return state;
  }
}
