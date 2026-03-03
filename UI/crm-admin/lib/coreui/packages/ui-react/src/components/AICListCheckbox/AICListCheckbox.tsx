/**
 * React AICListCheckbox component.
 * Scrollable checkbox list with search, chips, clear all,
 * and selection count footer.
 *
 * Source: Angular list-checkbox.component.ts
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  cn,
  listCheckboxStateStyles,
  listCheckboxReducer,
  initialListCheckboxState,
  resolveListCheckboxState,
  filterListCheckboxOptions,
  getVisibleChips,
  getRemainingCount,
} from "@coreui/ui";

import type {
  ListCheckboxOption,
  ListCheckboxInternalState,
  ListCheckboxAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ListCheckboxProps {
  value?: (string | number | boolean)[];
  defaultValue?: (string | number | boolean)[];
  options?: ListCheckboxOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  maxHeight?: string;
  maxChips?: number;
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

const SearchIcon: React.FC = () => (
  <svg
    className="h-4 w-4 text-[var(--color-text-tertiary)]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ChipRemoveIcon: React.FC = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICListCheckbox = React.forwardRef<HTMLDivElement, ListCheckboxProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = [],
      options = [],
      label,
      placeholder = "Search...",
      required = false,
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      maxHeight = "250px",
      maxChips = 5,
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
      useState<ListCheckboxInternalState>(() => ({
        ...initialListCheckboxState,
        selectedValues: controlledValue ?? defaultValue,
      }));

    const dispatch = useCallback(
      (action: ListCheckboxAction) => {
        setInternalState((prev) => {
          const next = listCheckboxReducer(prev, action);
          if (
            action.type === "TOGGLE_OPTION" ||
            action.type === "REMOVE_OPTION" ||
            action.type === "CLEAR"
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

    // Filtered options
    const filteredOptions = useMemo(
      () => filterListCheckboxOptions(options, internalState.searchQuery),
      [options, internalState.searchQuery],
    );

    // Chips
    const visibleChips = useMemo(
      () => getVisibleChips(currentValues, options, maxChips),
      [currentValues, options, maxChips],
    );

    const remainingCount = useMemo(
      () => getRemainingCount(currentValues, options, maxChips),
      [currentValues, options, maxChips],
    );

    const hasError = error;

    const visualState = resolveListCheckboxState(
      { disabled, readOnly, error: hasError },
      internalState,
    );

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleToggle = useCallback(
      (val: string | number | boolean) => {
        if (disabled || readOnly) return;
        dispatch({ type: "TOGGLE_OPTION", value: val });
      },
      [disabled, readOnly, dispatch],
    );

    const handleRemoveChip = useCallback(
      (e: React.MouseEvent, val: string | number | boolean) => {
        e.stopPropagation();
        if (disabled || readOnly) return;
        dispatch({ type: "REMOVE_OPTION", value: val });
        onChange?.(currentValues.filter((v) => v !== val));
      },
      [disabled, readOnly, dispatch, onChange, currentValues],
    );

    const handleClearAll = useCallback(() => {
      if (disabled || readOnly) return;
      dispatch({ type: "CLEAR" });
    }, [disabled, readOnly, dispatch]);

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

    const handleBlur = useCallback(
      (e: React.FocusEvent) => {
        const container = (e.currentTarget as HTMLElement).closest(
          "[data-testid='list-checkbox-container']",
        );
        if (container && !container.contains(e.relatedTarget as Node)) {
          dispatch({ type: "BLUR" });
          onBlur?.();
        }
      },
      [dispatch, onBlur],
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

        {/* Main container */}
        <div
          className={cn(
            "border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] overflow-hidden flex flex-col transition-all",
            listCheckboxStateStyles[visualState],
            disabled && "pointer-events-none",
            className,
          )}
          data-testid="list-checkbox-container"
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel ?? label ?? "List checkbox"}
        >
          {/* Header: Search + Chips */}
          <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] sticky top-0 z-10">
            <div className="flex flex-wrap items-center gap-2 w-full border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] px-2 py-1.5 min-h-[38px]">
              <SearchIcon />

              {/* Chips */}
              {visibleChips.map((opt) => (
                <span
                  key={String(opt.value)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-border-focus)]/10 text-[var(--color-border-focus)] text-xs font-medium border border-[var(--color-border-focus)]/20 whitespace-nowrap"
                  data-testid={`list-checkbox-chip-${opt.value}`}
                >
                  {opt.label}
                  {!disabled && !readOnly && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(e, opt.value)}
                      className="hover:bg-[var(--color-bg-secondary)] rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${opt.label}`}
                    >
                      <ChipRemoveIcon />
                    </button>
                  )}
                </span>
              ))}

              {remainingCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-xs font-medium border border-[var(--color-border)] whitespace-nowrap"
                  data-testid="list-checkbox-remaining"
                >
                  +{remainingCount} more
                </span>
              )}

              {/* Search input */}
              <input
                type="text"
                placeholder={
                  currentValues.length === 0 ? placeholder : ""
                }
                value={internalState.searchQuery}
                onChange={handleSearchChange}
                className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]"
                disabled={disabled}
                readOnly={readOnly}
                data-testid="list-checkbox-search"
              />
            </div>
          </div>

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

          {/* Scrollable List */}
          <div
            className="overflow-y-auto bg-[var(--color-bg)]"
            style={{ maxHeight }}
            data-testid="list-checkbox-list"
          >
            {filteredOptions.map((opt, index) => {
              const isChecked = currentValues.includes(opt.value);
              const isLast = index === filteredOptions.length - 1;

              return (
                <div
                  key={String(opt.value)}
                  className={cn(
                    "flex items-center px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors",
                    !isLast && "border-b border-[var(--color-border)]/50",
                    isChecked && "bg-[var(--color-border-focus)]/5",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() =>
                    !opt.disabled && handleToggle(opt.value)
                  }
                  data-testid={`list-checkbox-item-${opt.value}`}
                >
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="h-4 w-4 rounded border-[var(--color-border)] pointer-events-none"
                      tabIndex={-1}
                    />
                  </div>
                  <div className="ml-3 text-sm flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-[var(--color-text)]",
                          isChecked &&
                            "text-[var(--color-border-focus)]",
                        )}
                      >
                        {opt.label}
                      </span>
                    </div>
                    {opt.description && (
                      <p className="text-[var(--color-text-tertiary)] text-xs mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="p-8 text-center text-[var(--color-text-tertiary)] text-sm">
                No items found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[var(--color-bg-secondary)] px-4 py-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)] flex justify-between items-center">
            <span data-testid="list-checkbox-count">
              {currentValues.length} selected
            </span>
            {currentValues.length > 0 && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[var(--color-border-focus)] hover:underline font-medium transition-colors"
                data-testid="list-checkbox-clear-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

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
  },
);

AICListCheckbox.displayName = "AICListCheckbox";
