/**
 * React AICCurrencyInput component.
 * Currency input with locale-aware formatting, symbol prefix, optional dropdown.
 *
 * Source: Angular currency-input.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  cn,
  currencyInputSizeStyles,
  currencyInputVariantStyles,
  currencyInputShapeStyles,
  currencyInputStateStyles,
  currencyInputReducer,
  initialCurrencyInputState,
  resolveCurrencyInputState,
  formatCurrency,
  validateCurrencyRange,
} from "@coreui/ui";

import type {
  CurrencyInputVariant,
  CurrencyInputSize,
  CurrencyInputShape,
  CurrencyOption,
  CurrencyLocale,
  CurrencyInputInternalState,
  CurrencyInputAction,
  CurrencyInputReducerConfig,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange" | "value" | "defaultValue"
  > {
  value?: number | null;
  defaultValue?: number | null;
  label?: string;
  placeholder?: string;
  currency?: string;
  decimals?: number;
  locale?: CurrencyLocale;
  min?: number;
  max?: number;
  currencies?: CurrencyOption[];
  variant?: CurrencyInputVariant;
  size?: CurrencyInputSize;
  shape?: CurrencyInputShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  ariaLabel?: string;
  /** Value change handler providing the numeric value. */
  onChange?: (value: number | null) => void;
  /** Currency change handler when user selects from dropdown. */
  onCurrencyChange?: (currency: CurrencyOption) => void;
}

// ---------------------------------------------------------------------------
// Chevron icon for currency dropdown
// ---------------------------------------------------------------------------

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICCurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = null,
    label = "Amount",
    placeholder,
    currency = "₹",
    decimals = 2,
    locale = "en-IN",
    min,
    max,
    currencies,
    variant = "outlined",
    size = "md",
    shape = "rounded",
    required = false,
    disabled = false,
    readOnly = false,
    error = false,
    errorMessage,
    ariaLabel,
    className,
    id,
    name,
    onChange,
    onCurrencyChange,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;

  const reducerConfig: CurrencyInputReducerConfig = {
    locale,
    decimals,
    min,
    max,
  };

  // Internal state
  const [internalState, setInternalState] =
    useState<CurrencyInputInternalState>(() => {
      const initialValue = controlledValue ?? defaultValue;
      const formatted = formatCurrency(initialValue, locale, decimals);
      return {
        ...initialCurrencyInputState,
        value: initialValue,
        displayValue: formatted,
      };
    });

  // Currency dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<
    CurrencyOption | undefined
  >(currencies?.[0]);

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
    (action: CurrencyInputAction) => {
      setInternalState((prev) => {
        const next = currencyInputReducer(prev, action, reducerConfig);
        // Queue notification for user-driven changes (not external sync)
        if (
          next.value !== prev.value &&
          action.type !== "FOCUS" &&
          action.type !== "BLUR" &&
          action.type !== "SET_VALUE"
        ) {
          pendingNotifyRef.current = { value: next.value };
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, decimals, min, max],
  );

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      dispatch({ type: "SET_VALUE", value: controlledValue ?? null });
    }
  }, [controlledValue, isControlled, dispatch]);

  const currentValue = isControlled
    ? (controlledValue ?? null)
    : internalState.value;

  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Min/max validation
  const rangeError = validateCurrencyRange(currentValue, min, max);
  const hasError = error || !!rangeError;
  const displayError = errorMessage || rangeError;

  // Derived state
  const visualState = resolveCurrencyInputState(
    { disabled, readOnly, error: hasError },
    internalState,
  );

  // Active currency symbol
  const activeCurrencySymbol = selectedCurrency?.symbol ?? currency;

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "INPUT", rawInput: e.target.value });
    },
    [dispatch],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      dispatch({ type: "FOCUS" });
      onFocus?.(e);
    },
    [dispatch, onFocus],
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
      onKeyDown?.(e);
    },
    [onKeyDown],
  );

  const handleCurrencySelect = useCallback(
    (opt: CurrencyOption) => {
      setSelectedCurrency(opt);
      setDropdownOpen(false);
      dispatch({ type: "SELECT_CURRENCY", currency: opt });
      onCurrencyChange?.(opt);
    },
    [dispatch, onCurrencyChange],
  );

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerClasses = cn(
    "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors",
    currencyInputVariantStyles[variant],
    currencyInputSizeStyles[size],
    shapeStylesHelper(variant, shape),
    currencyInputStateStyles[visualState],
    className,
  );

  const inputClasses =
    "flex-1 bg-transparent outline-none border-none min-w-0 text-inherit text-right font-mono placeholder:text-[var(--color-text-tertiary)]";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const resolvedPlaceholder =
    placeholder ?? (label?.trim() ? " " : "Enter amount");

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-[var(--color-text-secondary)]",
            required &&
              "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]",
          )}
        >
          {label}
        </label>
      )}

      {/* AICInput container */}
      <div
        className={containerClasses}
        data-testid="currency-input-container"
      >
        {/* Currency prefix / dropdown */}
        {currencies && currencies.length > 0 ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              className="inline-flex items-center gap-0.5 font-bold text-[var(--color-text-secondary)] text-sm select-none"
              onClick={() => !disabled && !readOnly && setDropdownOpen(!dropdownOpen)}
              disabled={disabled || readOnly}
              aria-label="AICSelect currency"
              data-testid="currency-dropdown-trigger"
            >
              {activeCurrencySymbol}
              <ChevronDownIcon />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
                role="listbox"
                data-testid="currency-dropdown-list"
              >
                {currencies.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={selectedCurrency?.code === opt.code}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors",
                      "hover:bg-[var(--color-bg-secondary)]",
                      selectedCurrency?.code === opt.code &&
                        "bg-[var(--color-bg-secondary)] font-medium",
                    )}
                    onClick={() => handleCurrencySelect(opt)}
                  >
                    <span className="font-bold w-4">{opt.symbol}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeCurrencySymbol ? (
          <span
            className="inline-flex shrink-0 items-center font-bold text-[var(--color-text-secondary)] text-sm select-none mr-1"
            data-testid="currency-symbol"
          >
            {activeCurrencySymbol}
          </span>
        ) : null}

        {/* Native input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          id={id}
          name={name}
          value={internalState.displayValue}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label={ariaLabel ?? label}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError && displayError && id ? `${id}-error` : undefined
          }
          data-testid="currency-input"
          {...rest}
        />
      </div>

      {/* Error message */}
      {hasError && displayError && (
        <span
          id={id ? `${id}-error` : undefined}
          className="text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {displayError}
        </span>
      )}
    </div>
  );
});

AICCurrencyInput.displayName = "AICCurrencyInput";

// ---------------------------------------------------------------------------
// Shape helper — standard variant ignores shape
// ---------------------------------------------------------------------------

function shapeStylesHelper(
  variant: CurrencyInputVariant,
  shape: CurrencyInputShape,
): string {
  if (variant === "standard") return "";
  return currencyInputShapeStyles[shape];
}
