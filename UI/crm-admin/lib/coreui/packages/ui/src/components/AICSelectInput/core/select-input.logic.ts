/**
 * SelectInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular select-input.component.ts + FormStore patterns.
 */

import type {
  SelectInputState,
  SelectInputOption,
  SelectInputOptionGroup,
} from "./select-input.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface SelectInputInternalState {
  isFocused: boolean;
  isOpen: boolean;
  /** Currently selected value. */
  selectedValue: string | number | boolean | null;
  /** Search query for filtering. */
  searchQuery: string;
  /** Index of the highlighted option (for keyboard nav). */
  highlightedIndex: number;
  /** Whether options are loading from API. */
  isLoading: boolean;
}

export const initialSelectInputState: SelectInputInternalState = {
  isFocused: false,
  isOpen: false,
  selectedValue: null,
  searchQuery: "",
  highlightedIndex: -1,
  isLoading: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type SelectInputAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "SELECT"; value: string | number | boolean }
  | { type: "CLEAR" }
  | { type: "SEARCH"; query: string }
  | { type: "SET_VALUE"; value: string | number | boolean | null }
  | { type: "HIGHLIGHT"; index: number }
  | { type: "HIGHLIGHT_NEXT"; optionCount: number }
  | { type: "HIGHLIGHT_PREV"; optionCount: number }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_OPTIONS_LOADED" };

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveSelectInputStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveSelectInputState(
  props: ResolveSelectInputStateProps,
  internalState: SelectInputInternalState,
): SelectInputState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused || internalState.isOpen) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Filter options by search query
// ---------------------------------------------------------------------------

/**
 * Filters options by label match (case-insensitive substring).
 */
export function filterSelectOptions(
  options: SelectInputOption[],
  query: string,
): SelectInputOption[] {
  if (!query.trim()) return options;
  const term = query.toLowerCase().trim();
  return options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(term) ||
      (opt.description && opt.description.toLowerCase().includes(term)),
  );
}

// ---------------------------------------------------------------------------
// Group options
// ---------------------------------------------------------------------------

/**
 * Groups options by their `group` field.
 * Options without a group are placed in an unnamed group at the end.
 */
export function groupSelectOptions(
  options: SelectInputOption[],
): SelectInputOptionGroup[] {
  const groupMap = new Map<string, SelectInputOption[]>();

  for (const opt of options) {
    const group = opt.group ?? "";
    const existing = groupMap.get(group);
    if (existing) {
      existing.push(opt);
    } else {
      groupMap.set(group, [opt]);
    }
  }

  const groups: SelectInputOptionGroup[] = [];
  for (const [group, opts] of groupMap) {
    groups.push({ group, options: opts });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Find option by value
// ---------------------------------------------------------------------------

export function findOptionByValue(
  options: SelectInputOption[],
  value: string | number | boolean | null,
): SelectInputOption | undefined {
  if (value === null || value === undefined) return undefined;
  return options.find((opt) => opt.value === value);
}

// ---------------------------------------------------------------------------
// Flatten grouped options for keyboard navigation
// ---------------------------------------------------------------------------

/**
 * Returns a flat list of selectable (non-disabled) options
 * from a filtered options array.
 */
export function getSelectableOptions(
  options: SelectInputOption[],
): SelectInputOption[] {
  return options.filter((opt) => !opt.disabled);
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function selectInputReducer(
  state: SelectInputInternalState,
  action: SelectInputAction,
): SelectInputInternalState {
  switch (action.type) {
    case "FOCUS": {
      return { ...state, isFocused: true };
    }
    case "BLUR": {
      return {
        ...state,
        isFocused: false,
        isOpen: false,
        searchQuery: "",
        highlightedIndex: -1,
      };
    }
    case "OPEN": {
      return {
        ...state,
        isOpen: true,
        highlightedIndex: -1,
        searchQuery: "",
      };
    }
    case "CLOSE": {
      return {
        ...state,
        isOpen: false,
        searchQuery: "",
        highlightedIndex: -1,
      };
    }
    case "TOGGLE": {
      if (state.isOpen) {
        return {
          ...state,
          isOpen: false,
          searchQuery: "",
          highlightedIndex: -1,
        };
      }
      return {
        ...state,
        isOpen: true,
        highlightedIndex: -1,
        searchQuery: "",
      };
    }
    case "SELECT": {
      return {
        ...state,
        selectedValue: action.value,
        isOpen: false,
        searchQuery: "",
        highlightedIndex: -1,
      };
    }
    case "CLEAR": {
      return {
        ...state,
        selectedValue: null,
        searchQuery: "",
        highlightedIndex: -1,
      };
    }
    case "SEARCH": {
      return {
        ...state,
        searchQuery: action.query,
        highlightedIndex: -1,
      };
    }
    case "SET_VALUE": {
      return { ...state, selectedValue: action.value };
    }
    case "HIGHLIGHT": {
      return { ...state, highlightedIndex: action.index };
    }
    case "HIGHLIGHT_NEXT": {
      const next =
        state.highlightedIndex < action.optionCount - 1
          ? state.highlightedIndex + 1
          : 0;
      return { ...state, highlightedIndex: next };
    }
    case "HIGHLIGHT_PREV": {
      const prev =
        state.highlightedIndex > 0
          ? state.highlightedIndex - 1
          : action.optionCount - 1;
      return { ...state, highlightedIndex: prev };
    }
    case "SET_LOADING": {
      return { ...state, isLoading: action.loading };
    }
    case "SET_OPTIONS_LOADED": {
      return { ...state, isLoading: false };
    }
    default:
      return state;
  }
}
