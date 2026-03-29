/**
 * CheckboxGroup state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular checkbox-group.component.ts — exact port.
 */

import type { CheckboxGroupOption } from "./checkbox-group.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface CheckboxGroupInternalState {
  selectedValues: (string | number | boolean)[];
}

export const initialCheckboxGroupState: CheckboxGroupInternalState = {
  selectedValues: [],
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type CheckboxGroupAction =
  | {
      type: "TOGGLE";
      value: string | number | boolean;
      maxSelection?: number;
    }
  | {
      type: "SELECT_ALL";
      options: CheckboxGroupOption[];
      maxSelection?: number;
    }
  | { type: "DESELECT_ALL" }
  | { type: "SET_VALUES"; values: (string | number | boolean)[] };

// ---------------------------------------------------------------------------
// Toggle value — exact port of Angular toggleValue
// ---------------------------------------------------------------------------

export function toggleCheckboxValue(
  currentValues: (string | number | boolean)[],
  value: string | number | boolean,
  maxSelection?: number,
): (string | number | boolean)[] {
  if (currentValues.includes(value)) {
    return currentValues.filter((v) => v !== value);
  }
  if (maxSelection && maxSelection > 0 && currentValues.length >= maxSelection) {
    return currentValues;
  }
  return [...currentValues, value];
}

// ---------------------------------------------------------------------------
// Check if can deselect (min selection enforcement)
// ---------------------------------------------------------------------------

export function canDeselect(
  currentCount: number,
  minSelection?: number,
): boolean {
  if (!minSelection || minSelection <= 0) return true;
  return currentCount > minSelection;
}

// ---------------------------------------------------------------------------
// Get grid columns class
// ---------------------------------------------------------------------------

export function getGridColsClass(cols?: number): string {
  if (!cols) return "md:grid-cols-2";
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    default:
      return "grid-cols-4";
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function checkboxGroupReducer(
  state: CheckboxGroupInternalState,
  action: CheckboxGroupAction,
): CheckboxGroupInternalState {
  switch (action.type) {
    case "TOGGLE": {
      const newValues = toggleCheckboxValue(
        state.selectedValues,
        action.value,
        action.maxSelection,
      );
      return { ...state, selectedValues: newValues };
    }

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

    default:
      return state;
  }
}
