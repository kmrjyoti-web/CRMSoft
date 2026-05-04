/**
 * Radio accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects that framework adapters can spread onto
 * DOM elements.
 */

// ---------------------------------------------------------------------------
// Radio ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getRadioA11yProps`. */
export interface RadioA11yInput {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

/** Shape of the object returned by `getRadioA11yProps`. */
export interface RadioA11yProps {
  role: "radio";
  "aria-checked": boolean;
  "aria-disabled"?: boolean;
  "aria-label"?: string;
  tabIndex: number;
}

/**
 * Computes the ARIA attributes for a Radio element.
 *
 * - `tabIndex` is `0` for the currently selected radio (or the first in a
 *   group when nothing is selected) and `-1` for all others, following the
 *   roving tabindex pattern. When disabled it is always `-1`.
 */
export function getRadioA11yProps(input: RadioA11yInput): RadioA11yProps {
  const {
    checked = false,
    disabled = false,
    ariaLabel,
  } = input;

  const props: RadioA11yProps = {
    role: "radio",
    "aria-checked": checked,
    tabIndex: disabled ? -1 : 0,
  };

  if (disabled) {
    props["aria-disabled"] = true;
  }

  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  }

  return props;
}

// ---------------------------------------------------------------------------
// RadioGroup ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getRadioGroupA11yProps`. */
export interface RadioGroupA11yInput {
  ariaLabel?: string;
}

/** Shape of the object returned by `getRadioGroupA11yProps`. */
export interface RadioGroupA11yProps {
  role: "radiogroup";
  "aria-label"?: string;
}

/**
 * Computes the ARIA attributes for a RadioGroup container.
 */
export function getRadioGroupA11yProps(
  input: RadioGroupA11yInput,
): RadioGroupA11yProps {
  const props: RadioGroupA11yProps = {
    role: "radiogroup",
  };

  if (input.ariaLabel) {
    props["aria-label"] = input.ariaLabel;
  }

  return props;
}
