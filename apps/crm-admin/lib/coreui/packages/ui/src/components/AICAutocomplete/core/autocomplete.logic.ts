/**
 * Autocomplete state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular autocomplete.component.ts + aic-autocomplete-core.
 */

import type {
  AutocompleteState,
  AutocompleteOption,
  AutocompleteOperator,
} from "./autocomplete.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface AutocompleteInternalState {
  isFocused: boolean;
  isOpen: boolean;
  /** Current input text (display value). */
  inputValue: string;
  /** Selected value(s). */
  selectedValues: (string | number)[];
  /** Index of highlighted option for keyboard nav. */
  highlightedIndex: number;
  /** Whether results are loading. */
  isLoading: boolean;
}

export const initialAutocompleteState: AutocompleteInternalState = {
  isFocused: false,
  isOpen: false,
  inputValue: "",
  selectedValues: [],
  highlightedIndex: -1,
  isLoading: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type AutocompleteAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT"; value: string }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SELECT"; value: string | number; label: string; isMulti: boolean }
  | { type: "CLEAR" }
  | { type: "SET_VALUE"; value: string | number | null; label: string }
  | { type: "HIGHLIGHT"; index: number }
  | { type: "HIGHLIGHT_NEXT"; optionCount: number }
  | { type: "HIGHLIGHT_PREV"; optionCount: number }
  | { type: "SET_LOADING"; loading: boolean };

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveAutocompleteStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveAutocompleteState(
  props: ResolveAutocompleteStateProps,
  internalState: AutocompleteInternalState,
): AutocompleteState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused || internalState.isOpen) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Filter options by operator — exact port of Angular operators
// ---------------------------------------------------------------------------

export function filterAutocompleteOptions(
  options: AutocompleteOption[],
  query: string,
  operator: AutocompleteOperator = "contains",
): AutocompleteOption[] {
  if (!query.trim()) return options;
  const term = query.toLowerCase().trim();

  return options.filter((opt) => {
    const label = opt.label.toLowerCase();
    switch (operator) {
      case "startsWith":
        return label.startsWith(term);
      case "equals":
        return label === term;
      case "contains":
      default:
        return label.includes(term);
    }
  });
}

// ---------------------------------------------------------------------------
// Highlight matching text in label
// ---------------------------------------------------------------------------

/**
 * Splits a label into segments: matched (highlighted) and unmatched.
 * Used for rendering match highlighting in results.
 */
export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function highlightMatch(
  label: string,
  query: string,
): HighlightSegment[] {
  if (!query.trim()) return [{ text: label, highlighted: false }];

  const lowerLabel = label.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerLabel.indexOf(lowerQuery);

  if (idx === -1) return [{ text: label, highlighted: false }];

  const segments: HighlightSegment[] = [];
  if (idx > 0) {
    segments.push({ text: label.slice(0, idx), highlighted: false });
  }
  segments.push({
    text: label.slice(idx, idx + lowerQuery.length),
    highlighted: true,
  });
  if (idx + lowerQuery.length < label.length) {
    segments.push({
      text: label.slice(idx + lowerQuery.length),
      highlighted: false,
    });
  }
  return segments;
}

// ---------------------------------------------------------------------------
// Find option by value
// ---------------------------------------------------------------------------

export function findAutocompleteOption(
  options: AutocompleteOption[],
  value: string | number | null,
): AutocompleteOption | undefined {
  if (value === null || value === undefined) return undefined;
  return options.find((opt) => opt.value === value);
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function autocompleteReducer(
  state: AutocompleteInternalState,
  action: AutocompleteAction,
): AutocompleteInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true, isOpen: true };

    case "BLUR":
      return {
        ...state,
        isFocused: false,
        isOpen: false,
        highlightedIndex: -1,
      };

    case "INPUT":
      return {
        ...state,
        inputValue: action.value,
        isOpen: true,
        highlightedIndex: -1,
      };

    case "OPEN":
      return { ...state, isOpen: true, highlightedIndex: -1 };

    case "CLOSE":
      return { ...state, isOpen: false, highlightedIndex: -1 };

    case "SELECT": {
      if (action.isMulti) {
        const isSelected = state.selectedValues.includes(action.value);
        const newValues = isSelected
          ? state.selectedValues.filter((v) => v !== action.value)
          : [...state.selectedValues, action.value];
        return {
          ...state,
          selectedValues: newValues,
          highlightedIndex: -1,
        };
      }
      // Single select
      return {
        ...state,
        selectedValues: [action.value],
        inputValue: action.label,
        isOpen: false,
        highlightedIndex: -1,
      };
    }

    case "CLEAR":
      return {
        ...state,
        selectedValues: [],
        inputValue: "",
        highlightedIndex: -1,
      };

    case "SET_VALUE":
      return {
        ...state,
        selectedValues: action.value !== null ? [action.value] : [],
        inputValue: action.label,
      };

    case "HIGHLIGHT":
      return { ...state, highlightedIndex: action.index };

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

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    default:
      return state;
  }
}
