/**
 * React AICRadio component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useCallback } from "react";

import {
  getRadioStyles,
  getRadioWrapperStyles,
  getRadioLabelStyles,
  getRadioDescriptionStyles,
  getRadioGroupStyles,
  getRadioA11yProps,
  getRadioGroupA11yProps,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// AICRadio Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICRadio props.
 */
export interface RadioProps {
  /** The value this radio represents. */
  value?: string;
  /** Whether the radio is currently selected. */
  checked?: boolean;
  /** Whether the radio is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** HTML name attribute — should match across a radio group. */
  name?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler called with the value of this radio. */
  onChange?: (value: string) => void;
}

// ---------------------------------------------------------------------------
// AICRadio Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICRadio built on the shared core logic from `@coreui/ui`.
 *
 * Renders a hidden native `<input type="radio">` for form support alongside
 * a custom styled circular indicator with an inner dot.
 */
export const AICRadio = React.forwardRef<HTMLInputElement, RadioProps>(
  (props, ref) => {
    const {
      value = "",
      checked = false,
      disabled = false,
      label,
      description,
      name,
      className,
      id,
      ariaLabel,
      onChange,
    } = props;

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const radioClasses = getRadioStyles({ checked, disabled, className });
    const wrapperClasses = getRadioWrapperStyles({ disabled });
    const labelClasses = getRadioLabelStyles({ disabled });
    const descriptionClasses = getRadioDescriptionStyles();

    const a11yProps = getRadioA11yProps({
      checked,
      disabled,
      id,
      ariaLabel,
    });

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleSelect = useCallback(() => {
      if (disabled || checked) return;
      onChange?.(value);
    }, [disabled, checked, value, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      },
      [disabled, handleSelect],
    );

    const handleInputChange = useCallback(
      (_e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        onChange?.(value);
      },
      [disabled, value, onChange],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <label className={wrapperClasses}>
        {/* Hidden native input for form support */}
        <input
          ref={ref}
          type="radio"
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

        {/* Custom styled radio indicator */}
        <div
          className={radioClasses}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
          {...a11yProps}
        >
          {/* Inner dot (visible when checked) */}
          {checked && (
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-inverse)]" />
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

AICRadio.displayName = "AICRadio";

// ---------------------------------------------------------------------------
// AICRadioGroup Props
// ---------------------------------------------------------------------------

export interface RadioGroupProps {
  /** HTML name attribute shared by all radios in the group. */
  name?: string;
  /** Currently selected value (single selection). */
  value?: string;
  /** Change handler called with the newly selected value. */
  onChange?: (value: string) => void;
  /** Layout direction of the group items. */
  orientation?: "horizontal" | "vertical";
  /** Whether the group is in an error state. */
  error?: boolean;
  /** Error message to display below the group. */
  errorMessage?: string;
  /** Whether all radios in the group are disabled. */
  disabled?: boolean;
  /** Accessible label for the group. */
  ariaLabel?: string;
  /** Group children (typically AICRadio components). */
  children?: React.ReactNode;
  /** Additional CSS class name(s). */
  className?: string;
}

// ---------------------------------------------------------------------------
// AICRadioGroup Component
// ---------------------------------------------------------------------------

/**
 * Manages a single selected value across child AICRadio components.
 * Clones children to inject group-level props.
 */
export const AICRadioGroup: React.FC<RadioGroupProps> = (props) => {
  const {
    name,
    value,
    onChange,
    orientation = "vertical",
    error = false,
    errorMessage,
    disabled = false,
    ariaLabel,
    children,
    className,
  } = props;

  const groupClasses = getRadioGroupStyles({ orientation });
  const groupA11y = getRadioGroupA11yProps({ ariaLabel });

  const handleChildChange = useCallback(
    (childValue: string) => {
      onChange?.(childValue);
    },
    [onChange],
  );

  // Clone children to inject group-level props.
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<RadioProps>(child)) return child;

    const childValue = child.props.value;
    if (childValue === undefined) return child;

    return React.cloneElement(child, {
      checked: value === childValue,
      disabled: disabled || child.props.disabled,
      name: name || child.props.name,
      onChange: () => handleChildChange(childValue),
    });
  });

  return (
    <div
      {...groupA11y}
      className={className ? `${groupClasses} ${className}` : groupClasses}
    >
      {enhancedChildren}
      {error && errorMessage && (
        <span className="text-xs text-[var(--color-danger)]">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

AICRadioGroup.displayName = "AICRadioGroup";
