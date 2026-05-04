/**
 * Select accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { SelectAction } from "./select.logic";

// ---------------------------------------------------------------------------
// Trigger ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getSelectTriggerA11yProps`. */
export interface SelectTriggerA11yInput {
  isOpen: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  multiple?: boolean;
}

/** Shape of the object returned by `getSelectTriggerA11yProps`. */
export interface SelectTriggerA11yProps {
  role: "combobox";
  "aria-expanded": boolean;
  "aria-haspopup": "listbox";
  "aria-controls": string | undefined;
  "aria-disabled": boolean | undefined;
  "aria-label": string | undefined;
  "aria-multiselectable"?: boolean;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for the Select trigger button.
 *
 * - `role="combobox"` identifies the element as a combo box.
 * - `aria-expanded` reflects whether the dropdown is open.
 * - `aria-haspopup="listbox"` indicates a listbox popup.
 * - `aria-controls` references the listbox element id.
 * - `aria-disabled` mirrors the disabled state.
 */
export function getSelectTriggerA11yProps(
  input: SelectTriggerA11yInput,
): SelectTriggerA11yProps {
  const {
    isOpen,
    disabled = false,
    id,
    ariaLabel,
    multiple = false,
  } = input;

  const props: SelectTriggerA11yProps = {
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-haspopup": "listbox",
    "aria-controls": id ? `${id}-listbox` : undefined,
    "aria-disabled": disabled || undefined,
    "aria-label": ariaLabel || undefined,
    tabIndex: disabled ? -1 : 0,
  };

  if (multiple) {
    props["aria-multiselectable"] = true;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Listbox ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getSelectListboxA11yProps`. */
export interface SelectListboxA11yInput {
  id?: string;
}

/** Shape of the object returned by `getSelectListboxA11yProps`. */
export interface SelectListboxA11yProps {
  role: "listbox";
  id: string | undefined;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for the Select dropdown listbox.
 */
export function getSelectListboxA11yProps(
  input: SelectListboxA11yInput,
): SelectListboxA11yProps {
  return {
    role: "listbox",
    id: input.id ? `${input.id}-listbox` : undefined,
    tabIndex: -1,
  };
}

// ---------------------------------------------------------------------------
// Option ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getSelectOptionA11yProps`. */
export interface SelectOptionA11yInput {
  id?: string;
  index: number;
  isSelected: boolean;
  isDisabled?: boolean;
}

/** Shape of the object returned by `getSelectOptionA11yProps`. */
export interface SelectOptionA11yProps {
  role: "option";
  id: string | undefined;
  "aria-selected": boolean;
  "aria-disabled": boolean | undefined;
}

/**
 * Computes the ARIA attributes for a single Select option.
 */
export function getSelectOptionA11yProps(
  input: SelectOptionA11yInput,
): SelectOptionA11yProps {
  const { id, index, isSelected, isDisabled = false } = input;

  return {
    role: "option",
    id: id ? `${id}-option-${index}` : undefined,
    "aria-selected": isSelected,
    "aria-disabled": isDisabled || undefined,
  };
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * A keyboard handler entry that maps to a SelectAction type,
 * with an optional payload factory.
 */
export interface SelectKeyboardHandler {
  actionType: SelectAction["type"];
  /** For HIGHLIGHT_INDEX actions, the index value to set. */
  payload?: "first" | "last";
}

/**
 * Returns a mapping from keyboard key values to the `SelectAction` type
 * that should be dispatched when that key is pressed.
 *
 * - ArrowDown -> HIGHLIGHT_NEXT
 * - ArrowUp   -> HIGHLIGHT_PREV
 * - Enter     -> SELECT (the currently highlighted option)
 * - Space     -> SELECT (the currently highlighted option)
 * - Escape    -> CLOSE
 * - Home      -> HIGHLIGHT_INDEX (first)
 * - End       -> HIGHLIGHT_INDEX (last)
 */
export function getSelectKeyboardHandlers(): Record<string, SelectKeyboardHandler> {
  return {
    ArrowDown: { actionType: "HIGHLIGHT_NEXT" },
    ArrowUp: { actionType: "HIGHLIGHT_PREV" },
    Enter: { actionType: "SELECT" },
    " ": { actionType: "SELECT" },
    Escape: { actionType: "CLOSE" },
    Home: { actionType: "HIGHLIGHT_INDEX", payload: "first" },
    End: { actionType: "HIGHLIGHT_INDEX", payload: "last" },
  };
}
