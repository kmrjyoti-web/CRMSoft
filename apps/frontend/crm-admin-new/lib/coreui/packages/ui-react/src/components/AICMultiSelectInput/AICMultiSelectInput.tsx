/**
 * React AICMultiSelectInput component.
 * Multi-select dropdown with chips, search, select all/deselect all,
 * and max selection limit.
 *
 * Source: Angular multi-select-input.component.ts
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  cn,
  multiSelectSizeStyles,
  multiSelectVariantStyles,
  multiSelectShapeStyles,
  multiSelectStateStyles,
  multiSelectReducer,
  initialMultiSelectState,
  resolveMultiSelectState,
  filterMultiSelectOptions,
  getMultiSelectDisplayLabel,
  getSelectedOptions,
  canSelectMore,
} from "@coreui/ui";

import type {
  MultiSelectVariant,
  MultiSelectSize,
  MultiSelectShape,
  MultiSelectOption,
  MultiSelectInternalState,
  MultiSelectAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MultiSelectInputProps {
  value?: (string | number | boolean)[];
  defaultValue?: (string | number | boolean)[];
  options?: MultiSelectOption[];
  label?: string;
  placeholder?: string;
  variant?: MultiSelectVariant;
  size?: MultiSelectSize;
  shape?: MultiSelectShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  searchable?: boolean;
  maxSelection?: number;
  loading?: boolean;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (values: (string | number | boolean)[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="12"
    height="12"
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

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 text-[var(--color-text-tertiary)]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICMultiSelectInput = React.forwardRef<
  HTMLDivElement,
  MultiSelectInputProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = [],
    options = [],
    label,
    placeholder = "AICSelect...",
    variant = "outlined",
    size = "md",
    shape = "rounded",
    required = false,
    disabled = false,
    readOnly = false,
    error = false,
    errorMessage,
    searchable = false,
    maxSelection,
    loading: externalLoading = false,
    className,
    id,
    name,
    ariaLabel,
    onChange,
    onBlur,
    onFocus,
  } = props;

  const isControlled = controlledValue !== undefined;

  const [internalState, setInternalState] =
    useState<MultiSelectInternalState>(() => ({
      ...initialMultiSelectState,
      selectedValues: controlledValue ?? defaultValue,
    }));

  const dispatch = useCallback(
    (action: MultiSelectAction) => {
      setInternalState((prev) => {
        const next = multiSelectReducer(prev, action);
        if (
          action.type === "TOGGLE_OPTION" ||
          action.type === "REMOVE_OPTION" ||
          action.type === "SELECT_ALL" ||
          action.type === "DESELECT_ALL"
        ) {
          onChange?.(next.selectedValues);
        }
        return next;
      });
    },
    [onChange],
  );

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      dispatch({ type: "SET_VALUES", values: controlledValue ?? [] });
    }
  }, [controlledValue, isControlled, dispatch]);

  const currentValues = isControlled
    ? (controlledValue ?? [])
    : internalState.selectedValues;

  const selectedOpts = useMemo(
    () => getSelectedOptions(currentValues, options),
    [currentValues, options],
  );

  const displayLabel = useMemo(
    () => getMultiSelectDisplayLabel(currentValues, options),
    [currentValues, options],
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!internalState.isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        dispatch({ type: "CLOSE" });
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [internalState.isOpen, dispatch]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (internalState.isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [internalState.isOpen, searchable]);

  // Filter options
  const filteredOptions = useMemo(
    () => filterMultiSelectOptions(options, internalState.searchQuery),
    [options, internalState.searchQuery],
  );

  const isLoading = externalLoading || internalState.isLoading;
  const hasError = error;

  const visualState = resolveMultiSelectState(
    { disabled, readOnly, error: hasError },
    internalState,
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleTriggerClick = useCallback(() => {
    if (disabled || readOnly) return;
    dispatch({ type: "TOGGLE_DROPDOWN" });
  }, [disabled, readOnly, dispatch]);

  const handleOptionToggle = useCallback(
    (opt: MultiSelectOption) => {
      if (opt.disabled || disabled || readOnly) return;
      dispatch({
        type: "TOGGLE_OPTION",
        value: opt.value,
        maxSelection,
      });
    },
    [disabled, readOnly, maxSelection, dispatch],
  );

  const handleRemoveChip = useCallback(
    (e: React.MouseEvent, value: string | number | boolean) => {
      e.stopPropagation();
      if (disabled || readOnly) return;
      dispatch({ type: "REMOVE_OPTION", value });
      onChange?.(currentValues.filter((v) => v !== value));
    },
    [disabled, readOnly, dispatch, onChange, currentValues],
  );

  const handleSelectAll = useCallback(() => {
    dispatch({ type: "SELECT_ALL", options: filteredOptions, maxSelection });
  }, [dispatch, filteredOptions, maxSelection]);

  const handleDeselectAll = useCallback(() => {
    dispatch({ type: "DESELECT_ALL" });
  }, [dispatch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SEARCH", query: e.target.value });
    },
    [dispatch],
  );

  const handleFocus = useCallback(() => {
    dispatch({ type: "FOCUS" });
    onFocus?.();
  }, [dispatch, onFocus]);

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.relatedTarget as Node)
      ) {
        dispatch({ type: "BLUR" });
        onBlur?.();
      }
    },
    [dispatch, onBlur],
  );

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const triggerClasses = cn(
    "flex w-full items-center gap-1 px-3 py-1 text-[var(--color-text)] transition-colors cursor-pointer select-none flex-wrap",
    multiSelectVariantStyles[variant],
    multiSelectSizeStyles[size],
    multiSelectShapeStyles[shape],
    multiSelectStateStyles[visualState],
    disabled && "pointer-events-none",
    className,
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-1 w-full" ref={ref}>
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

      {/* Trigger + Dropdown container */}
      <div
        ref={containerRef}
        className="relative w-full"
        onFocus={handleFocus}
        onBlurCapture={handleBlurCapture}
      >
        {/* Hidden inputs for form submission */}
        {name &&
          currentValues.map((val) => (
            <input
              key={String(val)}
              type="hidden"
              name={name}
              value={String(val)}
            />
          ))}

        {/* Trigger */}
        <div
          role="combobox"
          aria-expanded={internalState.isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel ?? label ?? "Multi select"}
          aria-invalid={hasError || undefined}
          tabIndex={disabled ? -1 : 0}
          id={id}
          className={triggerClasses}
          onClick={handleTriggerClick}
          data-testid="multi-select-trigger"
        >
          {/* Chips */}
          {selectedOpts.length > 0 ? (
            <>
              {selectedOpts.map((opt) => (
                <span
                  key={String(opt.value)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-border-focus)]/10 text-[var(--color-text)] text-xs font-medium border border-[var(--color-border)] whitespace-nowrap"
                  data-testid={`multi-select-chip-${opt.value}`}
                >
                  {opt.label}
                  {!disabled && !readOnly && (
                    <button
                      type="button"
                      className="hover:bg-[var(--color-bg-secondary)] rounded-full p-0.5 transition-colors"
                      onClick={(e) => handleRemoveChip(e, opt.value)}
                      aria-label={`Remove ${opt.label}`}
                      data-testid={`multi-select-chip-remove-${opt.value}`}
                    >
                      <ClearIcon />
                    </button>
                  )}
                </span>
              ))}
            </>
          ) : (
            <span className="flex-1 text-[var(--color-text-tertiary)] text-left truncate">
              {placeholder}
            </span>
          )}

          <span className="ml-auto flex items-center gap-1 shrink-0">
            {isLoading ? (
              <SpinnerIcon />
            ) : (
              <ChevronDownIcon
                className={cn(
                  "text-[var(--color-text-tertiary)] transition-transform",
                  internalState.isOpen && "rotate-180",
                )}
              />
            )}
          </span>
        </div>

        {/* Dropdown */}
        {internalState.isOpen && (
          <div
            className="absolute left-0 top-full z-10 mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg"
            role="listbox"
            aria-multiselectable="true"
            data-testid="multi-select-dropdown"
          >
            {/* Search input */}
            {searchable && (
              <div className="px-2 py-1 border-b border-[var(--color-border)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                  placeholder="Search..."
                  value={internalState.searchQuery}
                  onChange={handleSearchChange}
                  data-testid="multi-select-search"
                />
              </div>
            )}

            {/* AICSelect All / Deselect All */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--color-border)] text-xs">
              <button
                type="button"
                className="text-[var(--color-border-focus)] hover:underline font-medium"
                onClick={handleSelectAll}
                data-testid="multi-select-select-all"
              >
                AICSelect All
              </button>
              <button
                type="button"
                className="text-[var(--color-text-tertiary)] hover:underline font-medium"
                onClick={handleDeselectAll}
                data-testid="multi-select-deselect-all"
              >
                Deselect All
              </button>
            </div>

            <div className="max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <SpinnerIcon />
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = currentValues.includes(opt.value);
                  const isDisabledOption =
                    opt.disabled ||
                    (!isSelected &&
                      !canSelectMore(currentValues.length, maxSelection));

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isDisabledOption || undefined}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors",
                        isSelected && "bg-[var(--color-bg-secondary)]",
                        isDisabledOption
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-[var(--color-bg-secondary)]",
                      )}
                      onClick={() => handleOptionToggle(opt)}
                      data-testid={`multi-select-option-${opt.value}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="h-4 w-4 rounded border-[var(--color-border)] pointer-events-none"
                        tabIndex={-1}
                      />
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-xs text-[var(--color-text-tertiary)] truncate">
                          {opt.description}
                        </span>
                      )}
                    </button>
                  );
                })
              )}

              {!isLoading && filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-[var(--color-text-tertiary)]">
                  No options found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-1.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
              {currentValues.length} selected
              {maxSelection ? ` / ${maxSelection} max` : ""}
            </div>
          </div>
        )}
      </div>

      {/* Display label for multi-select (shows "N items selected") */}
      {!internalState.isOpen && currentValues.length > 1 && (
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {displayLabel}
        </span>
      )}

      {/* Error message */}
      {hasError && errorMessage && (
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
});

AICMultiSelectInput.displayName = "AICMultiSelectInput";
