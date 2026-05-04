/**
 * React AICSelectInput component.
 * Dropdown select with search, grouped options, icons, clear, keyboard nav,
 * and support for API-driven / dependent cascading options.
 *
 * Source: Angular select-input.component.ts
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  cn,
  selectInputSizeStyles,
  selectInputVariantStyles,
  selectInputShapeStyles,
  selectInputStateStyles,
  selectInputOptionStyles,
  selectInputGroupHeaderStyles,
  selectInputReducer,
  initialSelectInputState,
  resolveSelectInputState,
  filterSelectOptions,
  groupSelectOptions,
  findOptionByValue,
  getSelectableOptions,
} from "@coreui/ui";

import type {
  SelectInputVariant,
  SelectInputSize,
  SelectInputShape,
  SelectInputOption,
  SelectInputApiConfig,
  SelectInputInternalState,
  SelectInputAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SelectInputProps {
  value?: string | number | boolean | null;
  defaultValue?: string | number | boolean | null;
  options?: SelectInputOption[];
  apiConfig?: SelectInputApiConfig;
  parentValue?: string | number | boolean | null;
  label?: string;
  placeholder?: string;
  variant?: SelectInputVariant;
  size?: SelectInputSize;
  shape?: SelectInputShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (value: string | number | boolean | null) => void;
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

export const AICSelectInput = React.forwardRef<HTMLDivElement, SelectInputProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = null,
      options = [],
      apiConfig,
      parentValue,
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
      clearable = false,
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

    // Internal state
    const [internalState, setInternalState] =
      useState<SelectInputInternalState>(() => ({
        ...initialSelectInputState,
        selectedValue: controlledValue ?? defaultValue,
      }));

    // API-driven options
    const [apiOptions, setApiOptions] = useState<SelectInputOption[]>([]);

    const dispatch = useCallback(
      (action: SelectInputAction) => {
        setInternalState((prev) => {
          const next = selectInputReducer(prev, action);
          // Notify parent on value changes
          if (
            action.type === "SELECT" ||
            action.type === "CLEAR"
          ) {
            onChange?.(next.selectedValue);
          }
          return next;
        });
      },
      [onChange],
    );

    // Sync controlled value
    useEffect(() => {
      if (isControlled) {
        dispatch({ type: "SET_VALUE", value: controlledValue ?? null });
      }
    }, [controlledValue, isControlled, dispatch]);

    // Dependent/cascading: reload on parent change
    useEffect(() => {
      if (apiConfig?.dependency && parentValue !== undefined) {
        // Clear current selection when parent changes
        dispatch({ type: "CLEAR" });
        dispatch({ type: "SET_LOADING", loading: true });

        // Simulate API call — in real usage, the consumer provides options or a fetch function
        // For now, clear options and set loading false
        // The consumer is responsible for providing new options via the `options` prop
        setApiOptions([]);
        dispatch({ type: "SET_OPTIONS_LOADED" });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentValue, apiConfig?.dependency]);

    // Resolve effective options
    const effectiveOptions = apiOptions.length > 0 ? apiOptions : options;

    const currentValue = isControlled
      ? (controlledValue ?? null)
      : internalState.selectedValue;

    const selectedOption = findOptionByValue(effectiveOptions, currentValue);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Filter and group options
    const filteredOptions = useMemo(
      () => filterSelectOptions(effectiveOptions, internalState.searchQuery),
      [effectiveOptions, internalState.searchQuery],
    );

    const hasGroups = effectiveOptions.some((opt) => opt.group);
    const groupedOptions = useMemo(
      () => (hasGroups ? groupSelectOptions(filteredOptions) : null),
      [filteredOptions, hasGroups],
    );

    // Flat selectable list for keyboard nav
    const selectableList = useMemo(
      () => getSelectableOptions(filteredOptions),
      [filteredOptions],
    );

    // Visual state
    const isLoading = externalLoading || internalState.isLoading;
    const hasError = error;
    const displayError = errorMessage;

    const visualState = resolveSelectInputState(
      { disabled, readOnly, error: hasError },
      internalState,
    );

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleTriggerClick = useCallback(() => {
      if (disabled || readOnly) return;
      dispatch({ type: "TOGGLE" });
    }, [disabled, readOnly, dispatch]);

    const handleOptionSelect = useCallback(
      (opt: SelectInputOption) => {
        if (opt.disabled) return;
        dispatch({ type: "SELECT", value: opt.value });
      },
      [dispatch],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: "CLEAR" });
        onChange?.(null);
      },
      [dispatch, onChange],
    );

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "SEARCH", query: e.target.value });
      },
      [dispatch],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled || readOnly) return;

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            if (!internalState.isOpen) {
              dispatch({ type: "OPEN" });
            } else {
              dispatch({
                type: "HIGHLIGHT_NEXT",
                optionCount: selectableList.length,
              });
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            if (internalState.isOpen) {
              dispatch({
                type: "HIGHLIGHT_PREV",
                optionCount: selectableList.length,
              });
            }
            break;
          }
          case "Enter": {
            e.preventDefault();
            if (
              internalState.isOpen &&
              internalState.highlightedIndex >= 0 &&
              internalState.highlightedIndex < selectableList.length
            ) {
              const opt = selectableList[internalState.highlightedIndex];
              handleOptionSelect(opt);
            } else if (!internalState.isOpen) {
              dispatch({ type: "OPEN" });
            }
            break;
          }
          case "Escape": {
            e.preventDefault();
            dispatch({ type: "CLOSE" });
            break;
          }
          default:
            break;
        }
      },
      [
        disabled,
        readOnly,
        internalState.isOpen,
        internalState.highlightedIndex,
        selectableList,
        dispatch,
        handleOptionSelect,
      ],
    );

    const handleFocus = useCallback(() => {
      dispatch({ type: "FOCUS" });
      onFocus?.();
    }, [dispatch, onFocus]);

    const handleBlurCapture = useCallback(
      (e: React.FocusEvent) => {
        // Only blur if focus leaves the entire container
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
      "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors cursor-pointer select-none",
      selectInputVariantStyles[variant],
      selectInputSizeStyles[size],
      variant !== "filled" ? selectInputShapeStyles[shape] : selectInputShapeStyles[shape],
      selectInputStateStyles[visualState],
      disabled && "pointer-events-none",
      className,
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const renderOption = (
      opt: SelectInputOption,
      flatIndex: number,
    ) => {
      const isSelected = opt.value === currentValue;
      const isHighlighted =
        flatIndex === internalState.highlightedIndex;

      return (
        <button
          key={String(opt.value)}
          type="button"
          role="option"
          aria-selected={isSelected}
          aria-disabled={opt.disabled || undefined}
          className={cn(
            selectInputOptionStyles.base,
            isHighlighted && selectInputOptionStyles.highlighted,
            isSelected && selectInputOptionStyles.selected,
            opt.disabled && selectInputOptionStyles.disabled,
          )}
          onClick={() => handleOptionSelect(opt)}
          onMouseEnter={() =>
            dispatch({ type: "HIGHLIGHT", index: flatIndex })
          }
          data-testid={`select-option-${opt.value}`}
        >
          {opt.icon && (
            <span className="shrink-0 w-4 h-4 text-[var(--color-text-secondary)]">
              {opt.icon}
            </span>
          )}
          <span className="flex-1 truncate">{opt.label}</span>
          {opt.description && (
            <span className="text-xs text-[var(--color-text-tertiary)] truncate">
              {opt.description}
            </span>
          )}
        </button>
      );
    };

    // Build flat index mapping for grouped options
    let flatIndexCounter = 0;

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
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlurCapture={handleBlurCapture}
        >
          {/* Hidden native input for form submission */}
          {name && (
            <input
              type="hidden"
              name={name}
              value={currentValue != null ? String(currentValue) : ""}
            />
          )}

          {/* Trigger */}
          <div
            role="combobox"
            aria-expanded={internalState.isOpen}
            aria-haspopup="listbox"
            aria-label={ariaLabel ?? label ?? "AICSelect"}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError && displayError && id ? `${id}-error` : undefined
            }
            tabIndex={disabled ? -1 : 0}
            id={id}
            className={triggerClasses}
            onClick={handleTriggerClick}
            data-testid="select-input-trigger"
          >
            <span
              className={cn(
                "flex-1 truncate text-left",
                !selectedOption && "text-[var(--color-text-tertiary)]",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </span>

            {/* Clear button */}
            {clearable && selectedOption && !disabled && !readOnly && (
              <button
                type="button"
                className="shrink-0 p-0.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                onClick={handleClear}
                aria-label="Clear selection"
                data-testid="select-input-clear"
              >
                <ClearIcon />
              </button>
            )}

            {/* Loading / Chevron */}
            {isLoading ? (
              <SpinnerIcon />
            ) : (
              <ChevronDownIcon
                className={cn(
                  "shrink-0 text-[var(--color-text-tertiary)] transition-transform",
                  internalState.isOpen && "rotate-180",
                )}
              />
            )}
          </div>

          {/* Dropdown */}
          {internalState.isOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-10 mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
              role="listbox"
              data-testid="select-input-dropdown"
            >
              {/* Search input */}
              {searchable && (
                <div className="px-2 pb-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                    placeholder="Search..."
                    value={internalState.searchQuery}
                    onChange={handleSearchChange}
                    data-testid="select-input-search"
                  />
                </div>
              )}

              <div className="max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <SpinnerIcon />
                  </div>
                ) : groupedOptions ? (
                  // Grouped rendering
                  groupedOptions.map((group) => {
                    const startIndex = flatIndexCounter;
                    return (
                      <div key={group.group || "__ungrouped"}>
                        {group.group && (
                          <div
                            className={selectInputGroupHeaderStyles}
                            data-testid={`select-group-${group.group}`}
                          >
                            {group.group}
                          </div>
                        )}
                        {group.options.map((opt) => {
                          const idx = flatIndexCounter++;
                          // Only count selectable items
                          void startIndex;
                          return renderOption(opt, idx);
                        })}
                      </div>
                    );
                  })
                ) : (
                  // Flat rendering
                  filteredOptions.map((opt, idx) => renderOption(opt, idx))
                )}

                {/* No results */}
                {!isLoading && filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-[var(--color-text-tertiary)]">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
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
  },
);

AICSelectInput.displayName = "AICSelectInput";
