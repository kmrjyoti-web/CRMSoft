/**
 * React AICDatePicker component.
 * Native date input with floating label, calendar icon suffix,
 * shape variants, prefix icon, min/max constraints.
 *
 * Source: Angular date-picker.component.ts
 */

import React, { useCallback, useState, useRef } from "react";
import {
  cn,
  GLOBAL_UI_CONFIG,
  CONTROL_SIZES,
  getShapeClass,
  isDateEmpty,
  formatDateForInput,
} from "@coreui/ui";
import type { DatePickerShape, FloatLabelMode } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DatePickerProps {
  /** Current date value in YYYY-MM-DD format. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Label text displayed above or inside the input. */
  label?: string;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Minimum selectable date in YYYY-MM-DD format. */
  min?: string;
  /** Maximum selectable date in YYYY-MM-DD format. */
  max?: string;
  /** Shape variant for border-radius styling. */
  shape?: DatePickerShape;
  /** Floating label behavior mode. */
  floatLabel?: FloatLabelMode;
  /** Icon node rendered on the left side of the input. */
  prefixIcon?: React.ReactNode;
  /** Whether the date picker is disabled. */
  disabled?: boolean;
  /** Whether the date picker is required. */
  required?: boolean;
  /** Whether the date picker is in an error state. */
  error?: boolean;
  /** Error message displayed below the input when `error` is true. */
  errorMessage?: string;
  /** Whether the input takes the full width of its container. */
  fluid?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Change handler providing the new date string. */
  onChange?: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICDatePicker built on native `<input type="date">`.
 * Uses `React.forwardRef` so consumers can attach refs to the underlying
 * `<input>` DOM element.
 */
export const AICDatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = "",
      label,
      placeholder,
      min,
      max,
      shape = "rounded",
      floatLabel = "auto",
      prefixIcon,
      disabled = false,
      required = false,
      error = false,
      errorMessage,
      fluid = false,
      className,
      id,
      name,
      onChange,
    } = props;

    // -----------------------------------------------------------------------
    // Controlled vs uncontrolled
    // -----------------------------------------------------------------------

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(
      formatDateForInput(defaultValue),
    );
    const currentValue = isControlled
      ? formatDateForInput(controlledValue)
      : internalValue;

    // -----------------------------------------------------------------------
    // Focus state for floating label
    // -----------------------------------------------------------------------

    const [isFocused, setIsFocused] = useState(false);

    // -----------------------------------------------------------------------
    // Refs
    // -----------------------------------------------------------------------

    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    // -----------------------------------------------------------------------
    // Derived state
    // -----------------------------------------------------------------------

    const isEmpty = isDateEmpty(currentValue);
    const shapeClass = getShapeClass(shape);

    // Floating label should be "active" (floated up) when focused or has value
    const isLabelActive =
      floatLabel === "on" ||
      floatLabel === "in" ||
      floatLabel === "over" ||
      isFocused ||
      !isEmpty;

    const showFloatingLabel =
      label !== undefined && floatLabel !== "off";

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [isControlled, onChange],
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleCalendarClick = useCallback(() => {
      if (disabled) return;
      try {
        inputRef.current?.showPicker();
      } catch {
        // showPicker() not supported in all browsers — fallback to focus
        inputRef.current?.focus();
      }
    }, [disabled, inputRef]);

    // -----------------------------------------------------------------------
    // Styles
    // -----------------------------------------------------------------------

    const containerClasses = cn(
      GLOBAL_UI_CONFIG.container,
      fluid ? "w-full" : "inline-block",
      className,
    );

    const inputClasses = cn(
      GLOBAL_UI_CONFIG.input,
      CONTROL_SIZES.medium.input,
      shapeClass,
      prefixIcon && GLOBAL_UI_CONFIG.inputHasPrefix,
      GLOBAL_UI_CONFIG.inputHasSuffix,
      // Hide native calendar picker indicator
      "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
      // When empty and not focused, make text transparent (matches Angular behavior)
      isEmpty && !isFocused && "text-transparent",
      error && "border-danger focus:border-danger focus:ring-danger",
      disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
    );

    const labelClasses = cn(
      GLOBAL_UI_CONFIG.label,
      prefixIcon && GLOBAL_UI_CONFIG.labelHasPrefix,
      isLabelActive ? GLOBAL_UI_CONFIG.activeOn : GLOBAL_UI_CONFIG.idle,
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div className={containerClasses} data-testid="date-picker">
        {/* Prefix icon */}
        {prefixIcon && (
          <div className={GLOBAL_UI_CONFIG.iconPrefixWrapper}>
            {prefixIcon}
          </div>
        )}

        {/* Native date input */}
        <input
          ref={inputRef}
          type="date"
          id={id}
          name={name}
          value={currentValue}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error || undefined}
          aria-describedby={error && errorMessage && id ? `${id}-error` : undefined}
          data-testid="date-picker-input"
        />

        {/* Floating label */}
        {showFloatingLabel && (
          <label
            htmlFor={id}
            className={labelClasses}
            data-testid="date-picker-label"
          >
            {label}
          </label>
        )}

        {/* Calendar icon suffix */}
        <div className={GLOBAL_UI_CONFIG.iconSuffixWrapper}>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={handleCalendarClick}
            className="cursor-pointer disabled:cursor-not-allowed"
            aria-label="Open calendar"
            data-testid="date-picker-calendar-icon"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <span
            id={id ? `${id}-error` : undefined}
            className={GLOBAL_UI_CONFIG.error}
            role="alert"
            data-testid="date-picker-error"
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

AICDatePicker.displayName = "AICDatePicker";
