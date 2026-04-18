/**
 * Select state reducer, filtering, and grouping logic.
 * Framework-agnostic — no React/Angular imports.
 *
 * Consumers (React, Angular, etc.) feed DOM events into the reducer via
 * dispatched actions to manage dropdown state and keyboard navigation.
 */

import type { SelectOption } from "./select.types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Discriminated union of actions the select reducer handles. */
export type SelectAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "HIGHLIGHT_NEXT"; options: SelectOption[] }
  | { type: "HIGHLIGHT_PREV"; options: SelectOption[] }
  | { type: "HIGHLIGHT_INDEX"; index: number }
  | { type: "SELECT"; option: SelectOption; multiple: boolean }
  | { type: "CLEAR" }
  | { type: "SEARCH"; query: string };

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** Internal interaction state tracked by the reducer. */
export interface SelectInternalState {
  isOpen: boolean;
  highlightedIndex: number;
  searchQuery: string;
  selectedValues: string[];
}

/** Starting state — closed, nothing highlighted or selected. */
export const initialSelectState: SelectInternalState = {
  isOpen: false,
  highlightedIndex: -1,
  searchQuery: "",
  selectedValues: [],
};

// ---------------------------------------------------------------------------
// Helpers: find next/prev non-disabled index
// ---------------------------------------------------------------------------

/**
 * Finds the next non-disabled option index, wrapping around.
 * Returns -1 if all options are disabled.
 */
function findNextEnabledIndex(
  options: SelectOption[],
  currentIndex: number,
): number {
  if (options.length === 0) return -1;

  const totalOptions = options.length;
  let nextIndex = (currentIndex + 1) % totalOptions;

  for (let i = 0; i < totalOptions; i++) {
    if (!options[nextIndex].disabled) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % totalOptions;
  }

  return -1;
}

/**
 * Finds the previous non-disabled option index, wrapping around.
 * Returns -1 if all options are disabled.
 */
function findPrevEnabledIndex(
  options: SelectOption[],
  currentIndex: number,
): number {
  if (options.length === 0) return -1;

  const totalOptions = options.length;
  let prevIndex = currentIndex <= 0
    ? totalOptions - 1
    : currentIndex - 1;

  for (let i = 0; i < totalOptions; i++) {
    if (!options[prevIndex].disabled) {
      return prevIndex;
    }
    prevIndex = prevIndex <= 0 ? totalOptions - 1 : prevIndex - 1;
  }

  return -1;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state reducer for select interactions.
 *
 * @param state  - Current internal state.
 * @param action - The interaction that occurred.
 * @returns Updated internal state.
 */
export function selectReducer(
  state: SelectInternalState,
  action: SelectAction,
): SelectInternalState {
  switch (action.type) {
    case "OPEN":
      return {
        ...state,
        isOpen: true,
        highlightedIndex: state.selectedValues.length > 0 ? 0 : -1,
        searchQuery: "",
      };

    case "CLOSE":
      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
        searchQuery: "",
      };

    case "TOGGLE":
      if (state.isOpen) {
        return {
          ...state,
          isOpen: false,
          highlightedIndex: -1,
          searchQuery: "",
        };
      }
      return {
        ...state,
        isOpen: true,
        highlightedIndex: state.selectedValues.length > 0 ? 0 : -1,
        searchQuery: "",
      };

    case "HIGHLIGHT_NEXT": {
      const nextIndex = findNextEnabledIndex(
        action.options,
        state.highlightedIndex,
      );
      return { ...state, highlightedIndex: nextIndex };
    }

    case "HIGHLIGHT_PREV": {
      const prevIndex = findPrevEnabledIndex(
        action.options,
        state.highlightedIndex,
      );
      return { ...state, highlightedIndex: prevIndex };
    }

    case "HIGHLIGHT_INDEX":
      return { ...state, highlightedIndex: action.index };

    case "SELECT": {
      const { option, multiple } = action;

      if (option.disabled) return state;

      if (multiple) {
        // Toggle selection for multi-select
        const isAlreadySelected = state.selectedValues.includes(option.value);
        const newSelected = isAlreadySelected
          ? state.selectedValues.filter((v) => v !== option.value)
          : [...state.selectedValues, option.value];

        return {
          ...state,
          selectedValues: newSelected,
          // Keep dropdown open in multi-select mode
        };
      }

      // Single select: replace and close
      return {
        ...state,
        selectedValues: [option.value],
        isOpen: false,
        highlightedIndex: -1,
        searchQuery: "",
      };
    }

    case "CLEAR":
      return {
        ...state,
        selectedValues: [],
        searchQuery: "",
      };

    case "SEARCH":
      return {
        ...state,
        searchQuery: action.query,
        highlightedIndex: 0,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// getFilteredOptions
// ---------------------------------------------------------------------------

/**
 * Filters options by a case-insensitive search query against the label.
 *
 * @param options     - Full list of options.
 * @param searchQuery - Current search string.
 * @returns Filtered options matching the query.
 */
export function getFilteredOptions(
  options: SelectOption[],
  searchQuery: string,
): SelectOption[] {
  if (!searchQuery.trim()) return options;

  const normalised = searchQuery.toLowerCase().trim();
  return options.filter((option) =>
    option.label.toLowerCase().includes(normalised),
  );
}

// ---------------------------------------------------------------------------
// getGroupedOptions
// ---------------------------------------------------------------------------

/** A group label paired with its options. */
export interface OptionGroup {
  /** Group label (empty string for ungrouped options). */
  group: string;
  /** Options belonging to this group. */
  options: SelectOption[];
}

/**
 * Groups options by their `group` field, preserving insertion order.
 * Options without a group are placed under an empty-string key first.
 *
 * @param options - Flat list of options.
 * @returns Ordered array of option groups.
 */
export function getGroupedOptions(options: SelectOption[]): OptionGroup[] {
  const groupMap = new Map<string, SelectOption[]>();

  for (const option of options) {
    const groupKey = option.group ?? "";
    const existing = groupMap.get(groupKey);
    if (existing) {
      existing.push(option);
    } else {
      groupMap.set(groupKey, [option]);
    }
  }

  const groups: OptionGroup[] = [];
  for (const [group, groupOptions] of groupMap) {
    groups.push({ group, options: groupOptions });
  }

  return groups;
}
