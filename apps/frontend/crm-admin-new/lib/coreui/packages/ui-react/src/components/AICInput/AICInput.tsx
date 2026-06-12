/**
 * React AICInput component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useReducer, useCallback, useRef, useEffect } from "react";

import {
  getInputStyles,
  getInputWrapperStyles,
  getInputErrorStyles,
  getInputA11yProps,
  getInputKeyboardHandlers,
  inputReducer,
  initialInputState,
  resolveInputState,
  shouldShowClear,
} from "@coreui/ui";

import type {
  InputType,
  InputSize,
  InputAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICInput props.
 * - `leftIcon` / `rightIcon` are widened to `ReactNode` (core uses `string`).
 * - The component also accepts all native `<input>` HTML attributes.
 */
export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "prefix" | "onChange" | "value"
  > {
  /** HTML input type attribute. */
  type?: InputType;
  /** Size preset. */
  size?: InputSize;
  /** Placeholder text. */
  placeholder?: string;
  /** Controlled input value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in an error state. */
  error?: boolean;
  /** Error message displayed below the input. */
  errorMessage?: string;
  /** Icon rendered on the left side of the input. */
  leftIcon?: React.ReactNode;
  /** Icon rendered on the right side of the input. */
  rightIcon?: React.ReactNode;
  /** Static text rendered before the input value. */
  prefix?: string;
  /** Static text rendered after the input value. */
  suffix?: string;
  /** Whether to show a clear button when the input has a value. */
  clearable?: boolean;
  /** Maximum number of characters allowed. */
  maxLength?: number;
  /** Whether to display a character count indicator. */
  showCharCount?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler providing the new value. */
  onChange?: (value: string) => void;
  /** Native change event handler. */
  onNativeChange?: React.ChangeEventHandler<HTMLInputElement>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICInput built on the shared core logic from `@coreui/ui`.
 *
 * Uses `React.forwardRef` so consumers can attach refs to the underlying
 * `<input>` DOM element.
 */
export const AICInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      type = "text",
      size = "md",
      placeholder,
      value: controlledValue,
      defaultValue = "",
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      clearable = false,
      maxLength,
      showCharCount = false,
      ariaLabel,
      className,
      id,
      name,
      onChange,
      onNativeChange,
      onFocus,
      onBlur,
      onKeyDown,
      ...rest
    } = props;

    // -----------------------------------------------------------------------
    // Determine controlled vs uncontrolled
    // -----------------------------------------------------------------------

    const isControlled = controlledValue !== undefined;

    // -----------------------------------------------------------------------
    // Internal interaction state
    // -----------------------------------------------------------------------

    const [internalState, dispatch] = useReducer(inputReducer, {
      ...initialInputState,
      value: controlledValue ?? defaultValue,
    });

    // Sync internal value with controlled value when it changes
    useEffect(() => {
      if (isControlled && controlledValue !== internalState.value) {
        dispatch({ type: "CHANGE", value: controlledValue });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue, isControlled]);

    // The current value: either controlled or from internal state
    const currentValue = isControlled ? controlledValue : internalState.value;

    // Internal ref to access the input element for imperative operations
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    // -----------------------------------------------------------------------
    // Derived state
    // -----------------------------------------------------------------------

    const visualState = resolveInputState(
      { disabled, readOnly, error },
      { ...internalState, value: currentValue },
    );

    const showClear = shouldShowClear(
      { clearable, disabled, readOnly },
      { ...internalState, value: currentValue },
    );

    // Track password visibility
    const [showPassword, setShowPassword] = React.useState(false);
    const resolvedType = type === "password" && showPassword ? "text" : type;

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const wrapperClasses = getInputWrapperStyles();
    const inputContainerClasses = getInputStyles({
      size,
      state: visualState,
      disabled,
      readOnly,
      error,
      className,
    });
    const errorClasses = getInputErrorStyles();

    const a11yProps = getInputA11yProps({
      disabled,
      readOnly,
      error,
      errorMessage,
      id,
      ariaLabel,
    });

    const keyMap = getInputKeyboardHandlers();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isControlled) {
          dispatch({ type: "CHANGE", value: newValue });
        }
        onChange?.(newValue);
        onNativeChange?.(e);
      },
      [isControlled, onChange, onNativeChange],
    );

    const handleClear = useCallback(() => {
      if (!isControlled) {
        dispatch({ type: "CLEAR" });
      }
      onChange?.("");
      // Refocus the input after clearing
      (inputRef as React.RefObject<HTMLInputElement>).current?.focus();
    }, [isControlled, onChange, inputRef]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch({ type: "FOCUS" });
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch({ type: "BLUR" });
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
          onKeyDown?.(e);
          return;
        }

        const actionType = keyMap[e.key] as InputAction["type"] | undefined;
        if (actionType === "CLEAR" && clearable && currentValue.length > 0) {
          e.preventDefault();
          handleClear();
        }

        onKeyDown?.(e);
      },
      [disabled, readOnly, keyMap, clearable, currentValue, handleClear, onKeyDown],
    );

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    // -----------------------------------------------------------------------
    // Character count
    // -----------------------------------------------------------------------

    const charCount = currentValue.length;
    const showCounter = showCharCount && maxLength !== undefined;

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div className={wrapperClasses}>
        {/* AICInput container */}
        <div className={inputContainerClasses}>
          {/* Left icon */}
          {leftIcon && (
            <span className="inline-flex shrink-0 items-center text-[var(--color-text-secondary)] mr-2">
              {leftIcon}
            </span>
          )}

          {/* Prefix */}
          {prefix && (
            <span className="inline-flex shrink-0 items-center text-[var(--color-text-secondary)] mr-1 select-none">
              {prefix}
            </span>
          )}

          {/* Native input element */}
          <input
            ref={inputRef}
            type={resolvedType}
            id={id}
            name={name}
            value={currentValue}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 bg-transparent outline-none border-none min-w-0 text-inherit placeholder:text-inherit"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...a11yProps}
            {...rest}
          />

          {/* Suffix */}
          {suffix && (
            <span className="inline-flex shrink-0 items-center text-[var(--color-text-secondary)] ml-1 select-none">
              {suffix}
            </span>
          )}

          {/* Clear button */}
          {showClear && (
            <button
              type="button"
              tabIndex={-1}
              className="inline-flex shrink-0 items-center justify-center ml-1 p-0.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Password visibility toggle */}
          {type === "password" && (
            <button
              type="button"
              tabIndex={-1}
              className="inline-flex shrink-0 items-center justify-center ml-1 p-0.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye icon */
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}

          {/* Right icon */}
          {rightIcon && (
            <span className="inline-flex shrink-0 items-center text-[var(--color-text-secondary)] ml-2">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Bottom row: error message and/or character counter */}
        {(error && errorMessage) || showCounter ? (
          <div className="flex items-center justify-between gap-2">
            {/* Error message */}
            {error && errorMessage ? (
              <span
                id={id ? `${id}-error` : undefined}
                className={errorClasses}
                role="alert"
              >
                {errorMessage}
              </span>
            ) : (
              <span />
            )}

            {/* Character counter */}
            {showCounter && (
              <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums ml-auto">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

AICInput.displayName = "AICInput";
