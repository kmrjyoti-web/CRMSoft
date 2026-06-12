/**
 * React AICCheckbox component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useCallback, useRef, useEffect } from "react";

import {
  getCheckboxStyles,
  getCheckboxWrapperStyles,
  getCheckboxGroupStyles,
  getCheckboxLabelStyles,
  getCheckboxDescriptionStyles,
  getCheckboxA11yProps,
  getCheckboxKeyboardHandlers,
} from "@coreui/ui";

import type {
  CheckboxAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICCheckbox props.
 * Extends the native HTML input attributes where applicable.
 */
export interface CheckboxProps {
  /** Whether the checkbox is checked. */
  checked?: boolean;
  /** Whether the checkbox is in the indeterminate (mixed) state. */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** Whether the checkbox is in an error state. */
  error?: boolean;
  /** HTML name attribute for the underlying input. */
  name?: string;
  /** HTML value attribute for the underlying input. */
  value?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler called with the new checked state. */
  onChange?: (checked: boolean) => void;
}

// ---------------------------------------------------------------------------
// AICCheckbox Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICCheckbox built on the shared core logic from `@coreui/ui`.
 *
 * Renders a hidden native `<input type="checkbox">` for form support alongside
 * a custom styled indicator with check / minus SVG icons.
 */
export const AICCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => {
    const {
      checked = false,
      indeterminate = false,
      disabled = false,
      label,
      description,
      error = false,
      name,
      value,
      className,
      id,
      ariaLabel,
      onChange,
    } = props;

    // Ref for the hidden native input to sync indeterminate property.
    const internalRef = useRef<HTMLInputElement | null>(null);

    // Sync the indeterminate DOM property (not an HTML attribute).
    useEffect(() => {
      const input = internalRef.current;
      if (input) {
        input.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const checkboxClasses = getCheckboxStyles({
      checked,
      indeterminate,
      disabled,
      error,
      className,
    });

    const wrapperClasses = getCheckboxWrapperStyles({ disabled });
    const labelClasses = getCheckboxLabelStyles({ disabled });
    const descriptionClasses = getCheckboxDescriptionStyles();

    const a11yProps = getCheckboxA11yProps({
      checked,
      indeterminate,
      disabled,
      id,
      ariaLabel,
    });

    const keyMap = getCheckboxKeyboardHandlers();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleToggle = useCallback(() => {
      if (disabled) return;
      onChange?.(!checked);
    }, [disabled, checked, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        const actionType = keyMap[e.key] as CheckboxAction["type"] | undefined;
        if (actionType === "TOGGLE") {
          e.preventDefault();
          handleToggle();
        }
      },
      [disabled, keyMap, handleToggle],
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        onChange?.(e.target.checked);
      },
      [disabled, onChange],
    );

    // Combined ref handler to support both forwardRef and internal ref.
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <label className={wrapperClasses}>
        {/* Hidden native input for form support */}
        <input
          ref={setRef}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
          id={id}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Custom styled checkbox indicator */}
        <div
          className={checkboxClasses}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          {...a11yProps}
        >
          {/* Check icon (visible when checked) */}
          {checked && !indeterminate && (
            <svg
              className="h-3 w-3 text-[var(--color-text-inverse)]"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Minus icon (visible when indeterminate) */}
          {indeterminate && (
            <svg
              className="h-3 w-3 text-[var(--color-text-inverse)]"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 6H9.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className={labelClasses}>{label}</span>}
            {description && (
              <span className={descriptionClasses}>{description}</span>
            )}
          </div>
        )}
      </label>
    );
  },
);

AICCheckbox.displayName = "AICCheckbox";

// ---------------------------------------------------------------------------
// AICCheckboxGroup Props
// ---------------------------------------------------------------------------

export interface CheckboxGroupProps {
  /** Currently selected values. */
  values?: string[];
  /** Change handler called with the updated array of selected values. */
  onChange?: (values: string[]) => void;
  /** Layout direction of the group items. */
  orientation?: "horizontal" | "vertical";
  /** Whether all checkboxes in the group are disabled. */
  disabled?: boolean;
  /** Whether all checkboxes in the group are in an error state. */
  error?: boolean;
  /** HTML name attribute shared by all checkboxes in the group. */
  name?: string;
  /** Group children (typically AICCheckbox components). */
  children?: React.ReactNode;
  /** Additional CSS class name(s). */
  className?: string;
}

// ---------------------------------------------------------------------------
// AICCheckboxGroup Component
// ---------------------------------------------------------------------------

/**
 * Manages an array of selected checkbox values. Provides context for child
 * AICCheckbox components when used in a group pattern.
 */
export const AICCheckboxGroup: React.FC<CheckboxGroupProps> = (props) => {
  const {
    values = [],
    onChange,
    orientation = "vertical",
    disabled = false,
    error = false,
    name,
    children,
    className,
  } = props;

  const groupClasses = getCheckboxGroupStyles({ orientation });

  const handleChildChange = useCallback(
    (childValue: string, childChecked: boolean) => {
      if (!onChange) return;

      const updated = childChecked
        ? [...values, childValue]
        : values.filter((v) => v !== childValue);

      onChange(updated);
    },
    [values, onChange],
  );

  // Clone children to inject group-level props.
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<CheckboxProps>(child)) return child;

    const childValue = child.props.value;
    if (childValue === undefined) return child;

    return React.cloneElement(child, {
      checked: values.includes(childValue),
      disabled: disabled || child.props.disabled,
      error: error || child.props.error,
      name: name || child.props.name,
      onChange: (checked: boolean) => handleChildChange(childValue, checked),
    });
  });

  return (
    <div role="group" className={className ? `${groupClasses} ${className}` : groupClasses}>
      {enhancedChildren}
    </div>
  );
};

AICCheckboxGroup.displayName = "AICCheckboxGroup";
