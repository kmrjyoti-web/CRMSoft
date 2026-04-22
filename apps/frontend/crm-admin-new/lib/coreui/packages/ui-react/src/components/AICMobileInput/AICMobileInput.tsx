/**
 * React AICMobileInput component.
 * Phone number input with country code selector, flag emoji, and phone formatting.
 *
 * Source: Angular mobile-input.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  cn,
  mobileInputSizeStyles,
  mobileInputVariantStyles,
  mobileInputShapeStyles,
  mobileInputStateStyles,
  mobileInputReducer,
  initialMobileInputState,
  resolveMobileInputState,
  applyPhoneMask,
  stripNonDigits,
  filterCountries,
  getPopularCountries,
  getNonPopularCountries,
  validatePhoneNumber,
  findCountryByCode,
  COUNTRY_DATABASE,
  DEFAULT_COUNTRY_CODE,
} from "@coreui/ui";

import type {
  MobileInputVariant,
  MobileInputSize,
  MobileInputShape,
  CountryData,
  MobileInputInternalState,
  MobileInputAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MobileInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  defaultCountry?: string;
  countries?: CountryData[];
  variant?: MobileInputVariant;
  size?: MobileInputSize;
  shape?: MobileInputShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  ariaLabel?: string;
  /** Value change handler (raw digits + dial code). */
  onChange?: (value: string, dialCode: string) => void;
  /** Country change handler. */
  onCountryChange?: (country: CountryData) => void;
}

// ---------------------------------------------------------------------------
// Chevron icon
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

export const AICMobileInput = React.forwardRef<
  HTMLInputElement,
  MobileInputProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    label,
    placeholder,
    defaultCountry = DEFAULT_COUNTRY_CODE,
    countries = COUNTRY_DATABASE,
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
    onCountryChange,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;

  // Resolve initial country
  const resolveInitialCountry = useCallback((): CountryData => {
    return (
      findCountryByCode(countries, defaultCountry) ??
      countries[0] ??
      COUNTRY_DATABASE[0]
    );
  }, [countries, defaultCountry]);

  // Internal state
  const [internalState, setInternalState] =
    useState<MobileInputInternalState>(() => {
      const country = resolveInitialCountry();
      const initialRaw = stripNonDigits(
        controlledValue ?? defaultValue ?? "",
      );
      const truncated = initialRaw.slice(0, country.maxLength);
      const display = country.mask
        ? applyPhoneMask(truncated, country.mask)
        : truncated;
      return {
        ...initialMobileInputState,
        selectedCountry: country,
        rawValue: truncated,
        displayValue: display,
      };
    });

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useCallback(
    (action: MobileInputAction) => {
      setInternalState((prev) => {
        const next = mobileInputReducer(prev, action);
        // Notify parent on value changes
        if (
          next.rawValue !== prev.rawValue &&
          action.type !== "FOCUS" &&
          action.type !== "BLUR"
        ) {
          const dialCode = next.selectedCountry?.dialCode ?? "";
          onChange?.(next.rawValue, dialCode);
        }
        // Notify parent on country change
        if (
          action.type === "SELECT_COUNTRY" &&
          next.selectedCountry &&
          next.selectedCountry.code !== prev.selectedCountry?.code
        ) {
          onCountryChange?.(next.selectedCountry);
        }
        return next;
      });
    },
    [onChange, onCountryChange],
  );

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      dispatch({ type: "SET_VALUE", value: controlledValue ?? "" });
    }
  }, [controlledValue, isControlled, dispatch]);

  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  // Phone validation
  const validationError = validatePhoneNumber(
    internalState.rawValue,
    internalState.selectedCountry,
  );
  const hasError = error || !!validationError;
  const displayError = errorMessage || validationError;

  // Visual state
  const visualState = resolveMobileInputState(
    { disabled, readOnly, error: hasError },
    internalState,
  );

  // Filtered countries for search
  const filteredCountries = filterCountries(countries, searchTerm);
  const popularFiltered = getPopularCountries(filteredCountries);
  const otherFiltered = getNonPopularCountries(filteredCountries);

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

  const handleCountrySelect = useCallback(
    (country: CountryData) => {
      dispatch({ type: "SELECT_COUNTRY", country });
      setDropdownOpen(false);
      setSearchTerm("");
      // Refocus the phone input
      inputRef.current?.focus();
    },
    [dispatch, inputRef],
  );

  const toggleDropdown = useCallback(() => {
    if (!disabled && !readOnly) {
      setDropdownOpen((prev) => !prev);
      setSearchTerm("");
    }
  }, [disabled, readOnly]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerClasses = cn(
    "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors",
    mobileInputVariantStyles[variant],
    mobileInputSizeStyles[size],
    shapeStylesHelper(variant, shape),
    mobileInputStateStyles[visualState],
    className,
  );

  const inputClasses =
    "flex-1 bg-transparent outline-none border-none min-w-0 text-inherit placeholder:text-[var(--color-text-tertiary)]";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const selectedCountry = internalState.selectedCountry;
  const resolvedPlaceholder =
    placeholder ??
    (selectedCountry?.mask
      ? selectedCountry.mask.replace(/0/g, "_")
      : "Enter phone number");

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
        data-testid="mobile-input-container"
      >
        {/* Country selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm select-none"
            onClick={toggleDropdown}
            disabled={disabled || readOnly}
            aria-label="AICSelect country"
            data-testid="country-dropdown-trigger"
          >
            <span className="text-base" aria-hidden="true">
              {selectedCountry?.flag}
            </span>
            <span className="font-medium text-[var(--color-text-secondary)]">
              {selectedCountry?.dialCode}
            </span>
            <ChevronDownIcon />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 top-full z-10 mt-1 w-[260px] rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
              role="listbox"
              data-testid="country-dropdown-list"
            >
              {/* Search */}
              <div className="px-2 pb-1">
                <input
                  ref={searchRef}
                  type="text"
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="country-search-input"
                />
              </div>

              <div className="max-h-[200px] overflow-y-auto">
                {/* Popular countries */}
                {popularFiltered.length > 0 && (
                  <>
                    {popularFiltered.map((country) => (
                      <CountryOption
                        key={country.code}
                        country={country}
                        isSelected={
                          selectedCountry?.code === country.code
                        }
                        onSelect={handleCountrySelect}
                      />
                    ))}
                    {otherFiltered.length > 0 && (
                      <div className="mx-2 my-1 border-t border-[var(--color-border)]" />
                    )}
                  </>
                )}

                {/* Other countries */}
                {otherFiltered.map((country) => (
                  <CountryOption
                    key={country.code}
                    country={country}
                    isSelected={
                      selectedCountry?.code === country.code
                    }
                    onSelect={handleCountrySelect}
                  />
                ))}

                {/* No results */}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-2 text-sm text-[var(--color-text-tertiary)]">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-[var(--color-border)] shrink-0" />

        {/* Phone input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
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
          autoComplete="tel"
          aria-label={ariaLabel ?? label ?? "Phone number"}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError && displayError && id ? `${id}-error` : undefined
          }
          data-testid="mobile-input"
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

AICMobileInput.displayName = "AICMobileInput";

// ---------------------------------------------------------------------------
// Country option row (extracted for reuse in popular + other sections)
// ---------------------------------------------------------------------------

interface CountryOptionProps {
  country: CountryData;
  isSelected: boolean;
  onSelect: (country: CountryData) => void;
}

const CountryOption: React.FC<CountryOptionProps> = ({
  country,
  isSelected,
  onSelect,
}) => (
  <button
    type="button"
    role="option"
    aria-selected={isSelected}
    className={cn(
      "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors",
      "hover:bg-[var(--color-bg-secondary)]",
      isSelected && "bg-[var(--color-bg-secondary)] font-medium",
    )}
    onClick={() => onSelect(country)}
    data-testid={`country-option-${country.code}`}
  >
    <span className="text-base">{country.flag}</span>
    <span className="flex-1 truncate">{country.name}</span>
    <span className="text-[var(--color-text-tertiary)]">
      {country.dialCode}
    </span>
  </button>
);

// ---------------------------------------------------------------------------
// Shape helper — standard variant ignores shape
// ---------------------------------------------------------------------------

function shapeStylesHelper(
  variant: MobileInputVariant,
  shape: MobileInputShape,
): string {
  if (variant === "standard") return "";
  return mobileInputShapeStyles[shape];
}
