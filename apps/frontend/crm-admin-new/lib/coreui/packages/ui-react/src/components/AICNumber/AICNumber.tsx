/**
 * React AICNumber component.
 * Numeric input with spinner buttons, min/max, step, currency mode.
 *
 * Source: Angular aic-number.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  cn,
  aicNumberSizeStyles,
  spinnerButtonSizes,
  aicNumberVariantStyles,
  aicNumberShapeStyles,
  aicNumberStateStyles,
  aicNumberReducer,
  initialAICNumberState,
  normalize,
  resolveAICNumberState,
  getLeftButtons,
  getRightButtons,
  formatNumber,
  parseFormattedNumber,
  canIncrement,
  canDecrement,
} from "@coreui/ui";

import type {
  AICNumberVariant,
  AICNumberSize,
  AICNumberShape,
  SpinnerLayout,
  CurrencySymbol,
  NumberLocale,
  AICNumberInternalState,
  AICNumberAction,
  AICNumberReducerConfig,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AICNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange" | "value" | "defaultValue"
  > {
  value?: number | null;
  defaultValue?: number | null;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  showSpinner?: boolean;
  spinnerLayout?: SpinnerLayout;
  variant?: AICNumberVariant;
  size?: AICNumberSize;
  shape?: AICNumberShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  currency?: CurrencySymbol;
  locale?: NumberLocale;
  ariaLabel?: string;
  /** Value change handler providing the numeric value. */
  onChange?: (value: number | null) => void;
}

// ---------------------------------------------------------------------------
// SVG icons for spinner buttons
// ---------------------------------------------------------------------------

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
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
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ---------------------------------------------------------------------------
// Long-press hook
// ---------------------------------------------------------------------------

function useLongPress(
  callback: () => void,
  { delay = 400, interval = 80 }: { delay?: number; interval?: number } = {},
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    callback();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(callback, interval);
    }, delay);
  }, [callback, delay, interval]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICNumber = React.forwardRef<HTMLInputElement, AICNumberProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = null,
      label = "Number",
      placeholder,
      min,
      max,
      step = 1,
      precision = 0,
      showSpinner = true,
      spinnerLayout = "right",
      variant = "outlined",
      size = "md",
      shape = "rounded",
      required = false,
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      currency,
      locale = "en-US",
      ariaLabel,
      className,
      id,
      name,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      ...rest
    } = props;

    const isControlled = controlledValue !== undefined;

    // Internal state
    const [internalState, setInternalState] = useState<AICNumberInternalState>({
      ...initialAICNumberState,
      value: controlledValue ?? defaultValue,
    });

    const reducerConfig: AICNumberReducerConfig = {
      step,
      min,
      max,
      precision,
    };

    // Keep onChange stable so dispatch never changes identity due to prop identity changes
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Pending notification — set inside setInternalState, flushed after via useEffect
    const pendingNotifyRef = useRef<{ value: number | null } | null>(null);

    useEffect(() => {
      if (pendingNotifyRef.current !== null) {
        const v = pendingNotifyRef.current.value;
        pendingNotifyRef.current = null;
        onChangeRef.current?.(v);
      }
    });

    const dispatch = useCallback(
      (action: AICNumberAction) => {
        setInternalState((prev) => {
          const next = aicNumberReducer(prev, action, reducerConfig);
          if (next.value !== prev.value && action.type !== "FOCUS" && action.type !== "BLUR") {
            pendingNotifyRef.current = { value: next.value };
          }
          return next;
        });
      },
      [step, min, max, precision],
    );

    // Sync controlled value
    useEffect(() => {
      if (isControlled && controlledValue !== internalState.value) {
        setInternalState((prev) => ({ ...prev, value: controlledValue ?? null }));
      }
    }, [controlledValue, isControlled]);

    const currentValue = isControlled
      ? (controlledValue ?? null)
      : internalState.value;

    // Track whether the input is focused (show raw number vs formatted)
    const [inputText, setInputText] = useState<string>(
      currentValue !== null ? String(currentValue) : "",
    );

    // When value changes externally and we're not focused, update display
    useEffect(() => {
      if (!internalState.isFocused) {
        setInputText(currentValue !== null ? String(currentValue) : "");
      }
    }, [currentValue, internalState.isFocused]);

    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    // Derived state
    const visualState = resolveAICNumberState(
      { disabled, readOnly, error },
      { ...internalState, value: currentValue },
    );

    // Spinner buttons
    const leftBtns = getLeftButtons(spinnerLayout, showSpinner);
    const rightBtns = getRightButtons(spinnerLayout, showSpinner);

    const canInc = canIncrement(currentValue, step, max);
    const canDec = canDecrement(currentValue, step, min);

    // Formatted display value
    const displayValue = internalState.isFocused
      ? inputText
      : formatNumber(currentValue, locale, precision);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleIncrement = useCallback(() => {
      if (disabled || readOnly || !canIncrement(currentValue, step, max)) return;
      if (isControlled) {
        const start = currentValue ?? 0;
        const next = normalize(start + step, { min, max, precision });
        onChange?.(next);
      } else {
        dispatch({ type: "INCREMENT" });
      }
    }, [disabled, readOnly, currentValue, step, min, max, precision, isControlled, onChange, dispatch]);

    const handleDecrement = useCallback(() => {
      if (disabled || readOnly || !canDecrement(currentValue, step, min)) return;
      if (isControlled) {
        const start = currentValue ?? 0;
        const next = normalize(start - step, { min, max, precision });
        onChange?.(next);
      } else {
        dispatch({ type: "DECREMENT" });
      }
    }, [disabled, readOnly, currentValue, step, min, max, precision, isControlled, onChange, dispatch]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setInputText(raw);

        if (raw === "" || raw === "-") {
          if (isControlled) {
            onChange?.(null);
          } else {
            dispatch({ type: "CHANGE", value: null });
          }
          return;
        }

        const parsed = parseFormattedNumber(raw);
        if (parsed === null) return;

        const normalized = normalize(parsed, { min, max, precision });
        if (isControlled) {
          onChange?.(normalized);
        } else {
          dispatch({ type: "CHANGE", value: normalized });
        }
      },
      [isControlled, onChange, dispatch, min, max, precision],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch({ type: "FOCUS" });
        // Show raw value on focus for editing
        setInputText(currentValue !== null ? String(currentValue) : "");
        onFocus?.(e);
      },
      [dispatch, currentValue, onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch({ type: "BLUR" });
        onBlur?.(e);
      },
      [dispatch, onBlur],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
          onKeyDown?.(e);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          handleIncrement();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          handleDecrement();
        }
        onKeyDown?.(e);
      },
      [disabled, readOnly, handleIncrement, handleDecrement, onKeyDown],
    );

    // Long-press handlers
    const incLongPress = useLongPress(handleIncrement);
    const decLongPress = useLongPress(handleDecrement);

    const handleSpinnerAction = useCallback(
      (action: "increase" | "decrease") => {
        if (action === "increase") handleIncrement();
        else handleDecrement();
      },
      [handleIncrement, handleDecrement],
    );

    // -----------------------------------------------------------------------
    // Styles
    // -----------------------------------------------------------------------

    const containerClasses = cn(
      "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors",
      aicNumberVariantStyles[variant],
      aicNumberSizeStyles[size],
      shapeStyles(variant, shape),
      aicNumberStateStyles[visualState],
      className,
    );

    const inputClasses =
      "flex-1 bg-transparent outline-none border-none min-w-0 text-inherit placeholder:text-[var(--color-text-tertiary)] tabular-nums";

    const btnClasses = cn(
      "inline-flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors select-none",
      "hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      spinnerButtonSizes[size],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const resolvedPlaceholder = placeholder ?? (label?.trim() ? " " : "Enter number");

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium text-[var(--color-text-secondary)]",
              required && "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]",
            )}
          >
            {label}
          </label>
        )}

        {/* AICInput container */}
        <div className={containerClasses} data-testid="aic-number-container">
          {/* Left spinner buttons */}
          {leftBtns.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {leftBtns.map((btn) => (
                <button
                  key={btn.action}
                  type="button"
                  className={btnClasses}
                  disabled={disabled || readOnly || (btn.action === "increase" ? !canInc : !canDec)}
                  aria-label={btn.label}
                  {...(btn.action === "increase" ? incLongPress : decLongPress)}
                  onClick={() => handleSpinnerAction(btn.action)}
                >
                  {btn.icon === "plus" ? <PlusIcon /> : <MinusIcon />}
                </button>
              ))}
            </div>
          )}

          {/* Currency prefix */}
          {currency && (
            <span className="inline-flex shrink-0 items-center text-[var(--color-text-secondary)] select-none mr-1 font-medium">
              {currency}
            </span>
          )}

          {/* Native input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            id={id}
            name={name}
            value={displayValue}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            readOnly={readOnly}
            className={inputClasses}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel ?? label}
            aria-invalid={error || undefined}
            aria-describedby={error && errorMessage && id ? `${id}-error` : undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue ?? undefined}
            role="spinbutton"
            {...rest}
          />

          {/* Right spinner buttons */}
          {rightBtns.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {rightBtns.map((btn) => (
                <button
                  key={btn.action}
                  type="button"
                  className={btnClasses}
                  disabled={disabled || readOnly || (btn.action === "increase" ? !canInc : !canDec)}
                  aria-label={btn.label}
                  {...(btn.action === "increase" ? incLongPress : decLongPress)}
                  onClick={() => handleSpinnerAction(btn.action)}
                >
                  {btn.icon === "plus" ? <PlusIcon /> : <MinusIcon />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <span
            id={id ? `${id}-error` : undefined}
            className="text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

AICNumber.displayName = "AICNumber";

// ---------------------------------------------------------------------------
// Shape helper — standard variant ignores shape
// ---------------------------------------------------------------------------

function shapeStyles(variant: AICNumberVariant, shape: AICNumberShape): string {
  if (variant === "standard") return "";
  return aicNumberShapeStyles[shape];
}
