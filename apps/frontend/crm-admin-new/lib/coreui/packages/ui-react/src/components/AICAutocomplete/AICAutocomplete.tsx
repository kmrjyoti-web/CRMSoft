/**
 * React AICAutocomplete component.
 * Type-ahead with debounce, view modes (general/table/card),
 * single/multi selection, keyboard nav, match highlighting.
 *
 * Source: Angular autocomplete.component.ts + aic-autocomplete-core
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  cn,
  autocompleteSizeStyles,
  autocompleteVariantStyles,
  autocompleteShapeStyles,
  autocompleteStateStyles,
  autocompleteReducer,
  initialAutocompleteState,
  resolveAutocompleteState,
  filterAutocompleteOptions,
  highlightMatch,
  findAutocompleteOption,
} from "@coreui/ui";

import type {
  AutocompleteVariant,
  AutocompleteSize,
  AutocompleteShape,
  AutocompleteViewMode,
  AutocompleteSelectionMode,
  AutocompleteOperator,
  AutocompleteOption,
  AutocompleteTableColumn,
  AutocompleteInternalState,
  AutocompleteAction,
  HighlightSegment,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AutocompleteProps {
  value?: string | number | (string | number)[] | null;
  defaultValue?: string | number | null;
  options?: AutocompleteOption[];
  label?: string;
  placeholder?: string;
  variant?: AutocompleteVariant;
  size?: AutocompleteSize;
  shape?: AutocompleteShape;
  viewMode?: AutocompleteViewMode;
  selectionMode?: AutocompleteSelectionMode;
  operator?: AutocompleteOperator;
  tableColumns?: AutocompleteTableColumn[];
  debounceMs?: number;
  minChars?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  loading?: boolean;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (
    value: AutocompleteOption | AutocompleteOption[] | null,
  ) => void;
  onSearch?: (query: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Highlighted text renderer
// ---------------------------------------------------------------------------

const HighlightedText: React.FC<{ segments: HighlightSegment[] }> = ({
  segments,
}) => (
  <>
    {segments.map((seg, i) =>
      seg.highlighted ? (
        <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0">
          {seg.text}
        </mark>
      ) : (
        <span key={i}>{seg.text}</span>
      ),
    )}
  </>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICAutocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = null,
      options = [],
      label,
      placeholder = "Type to search...",
      variant = "outlined",
      size = "md",
      shape = "rounded",
      viewMode = "general",
      selectionMode = "single",
      operator = "contains",
      tableColumns = [],
      debounceMs = 300,
      minChars = 1,
      required = false,
      disabled = false,
      readOnly = false,
      error = false,
      errorMessage,
      loading: externalLoading = false,
      className,
      id,
      name,
      ariaLabel,
      onChange,
      onSearch,
      onBlur,
      onFocus,
    } = props;

    const isMulti = selectionMode === "multi";
    const isControlled = controlledValue !== undefined;

    const [internalState, setInternalState] =
      useState<AutocompleteInternalState>(() => {
        const initial = { ...initialAutocompleteState };
        if (!isMulti && defaultValue !== null) {
          initial.selectedValues = [defaultValue];
          const opt = findAutocompleteOption(options, defaultValue);
          if (opt) initial.inputValue = opt.label;
        }
        return initial;
      });

    const dispatch = useCallback(
      (action: AutocompleteAction) => {
        setInternalState((prev) => autocompleteReducer(prev, action));
      },
      [],
    );

    // Sync controlled value
    useEffect(() => {
      if (!isControlled) return;
      if (isMulti) {
        const vals = Array.isArray(controlledValue)
          ? controlledValue
          : controlledValue !== null && controlledValue !== undefined
            ? [controlledValue]
            : [];
        dispatch({
          type: "SET_VALUE",
          value: vals.length > 0 ? vals[0] : null,
          label: "",
        });
        setInternalState((prev) => ({ ...prev, selectedValues: vals }));
      } else {
        const val =
          controlledValue !== null && controlledValue !== undefined
            ? (Array.isArray(controlledValue)
                ? controlledValue[0]
                : controlledValue)
            : null;
        const opt = findAutocompleteOption(options, val ?? null);
        dispatch({
          type: "SET_VALUE",
          value: val ?? null,
          label: opt?.label ?? "",
        });
      }
    }, [controlledValue, isControlled, isMulti, options, dispatch]);

    // Debounce timer
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
      if (!internalState.isOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          dispatch({ type: "BLUR" });
          onBlur?.();
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [internalState.isOpen, dispatch, onBlur]);

    // Filter options locally
    const filteredOptions = useMemo(() => {
      if (internalState.inputValue.length < minChars) return [];
      return filterAutocompleteOptions(
        options,
        internalState.inputValue,
        operator,
      );
    }, [options, internalState.inputValue, operator, minChars]);

    const isLoading = externalLoading || internalState.isLoading;
    const hasError = error;

    const visualState = resolveAutocompleteState(
      { disabled, readOnly, error: hasError },
      internalState,
    );

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        dispatch({ type: "INPUT", value: val });

        // Debounce onSearch callback
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (val.length >= minChars) {
            onSearch?.(val);
          }
        }, debounceMs);
      },
      [dispatch, debounceMs, minChars, onSearch],
    );

    const handleOptionSelect = useCallback(
      (opt: AutocompleteOption) => {
        if (opt.disabled) return;
        dispatch({
          type: "SELECT",
          value: opt.value,
          label: opt.label,
          isMulti,
        });

        if (isMulti) {
          const isAlreadySelected =
            internalState.selectedValues.includes(opt.value);
          const newValues = isAlreadySelected
            ? internalState.selectedValues.filter((v) => v !== opt.value)
            : [...internalState.selectedValues, opt.value];
          const selectedOptions = options.filter((o) =>
            newValues.includes(o.value),
          );
          onChange?.(selectedOptions.length > 0 ? selectedOptions : null);
        } else {
          onChange?.(opt);
        }
      },
      [dispatch, isMulti, internalState.selectedValues, options, onChange],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: "CLEAR" });
        onChange?.(null);
        inputRef.current?.focus();
      },
      [dispatch, onChange],
    );

    const handleFocus = useCallback(() => {
      dispatch({ type: "FOCUS" });
      onFocus?.();
    }, [dispatch, onFocus]);

    const handleBlur = useCallback(
      (e: React.FocusEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.relatedTarget as Node)
        ) {
          // Validate strict match for single mode
          if (!isMulti && internalState.inputValue) {
            const match = options.find(
              (o) =>
                o.label.toLowerCase() ===
                internalState.inputValue.toLowerCase(),
            );
            if (!match) {
              dispatch({ type: "CLEAR" });
              onChange?.(null);
            }
          }
          dispatch({ type: "BLUR" });
          onBlur?.();
        }
      },
      [
        dispatch,
        onBlur,
        isMulti,
        internalState.inputValue,
        options,
        onChange,
      ],
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
                optionCount: filteredOptions.length,
              });
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            if (internalState.isOpen) {
              dispatch({
                type: "HIGHLIGHT_PREV",
                optionCount: filteredOptions.length,
              });
            }
            break;
          }
          case "Enter": {
            e.preventDefault();
            if (
              internalState.isOpen &&
              internalState.highlightedIndex >= 0 &&
              internalState.highlightedIndex < filteredOptions.length
            ) {
              handleOptionSelect(
                filteredOptions[internalState.highlightedIndex],
              );
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
        filteredOptions,
        dispatch,
        handleOptionSelect,
      ],
    );

    // -----------------------------------------------------------------------
    // Styles
    // -----------------------------------------------------------------------

    const inputWrapperClasses = cn(
      "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors",
      autocompleteVariantStyles[variant],
      autocompleteSizeStyles[size],
      autocompleteShapeStyles[shape],
      autocompleteStateStyles[visualState],
      disabled && "pointer-events-none",
      className,
    );

    // -----------------------------------------------------------------------
    // Render option (general view)
    // -----------------------------------------------------------------------

    const renderGeneralOption = (
      opt: AutocompleteOption,
      index: number,
    ) => {
      const isSelected = internalState.selectedValues.includes(opt.value);
      const isHighlighted = index === internalState.highlightedIndex;
      const segments = highlightMatch(opt.label, internalState.inputValue);

      return (
        <button
          key={String(opt.value)}
          type="button"
          role="option"
          aria-selected={isSelected}
          aria-disabled={opt.disabled || undefined}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors cursor-pointer",
            isHighlighted && "bg-[var(--color-bg-secondary)]",
            isSelected && "bg-[var(--color-bg-secondary)] font-medium",
            opt.disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={() => handleOptionSelect(opt)}
          onMouseEnter={() => dispatch({ type: "HIGHLIGHT", index })}
          data-testid={`autocomplete-option-${opt.value}`}
        >
          {isMulti && (
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="h-4 w-4 rounded border-[var(--color-border)] pointer-events-none"
              tabIndex={-1}
            />
          )}
          {opt.image && (
            <img
              src={opt.image}
              alt=""
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
          )}
          <span className="flex-1 truncate">
            <HighlightedText segments={segments} />
          </span>
          {opt.description && (
            <span className="text-xs text-[var(--color-text-tertiary)] truncate">
              {opt.description}
            </span>
          )}
        </button>
      );
    };

    // -----------------------------------------------------------------------
    // Render option (table view)
    // -----------------------------------------------------------------------

    const renderTableView = () => (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {tableColumns.map((col) => (
              <th
                key={col.field}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredOptions.map((opt, index) => {
            const isSelected = internalState.selectedValues.includes(
              opt.value,
            );
            const isHighlighted = index === internalState.highlightedIndex;

            return (
              <tr
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "cursor-pointer transition-colors",
                  isHighlighted && "bg-[var(--color-bg-secondary)]",
                  isSelected && "bg-[var(--color-bg-secondary)] font-medium",
                  opt.disabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => handleOptionSelect(opt)}
                onMouseEnter={() =>
                  dispatch({ type: "HIGHLIGHT", index })
                }
                data-testid={`autocomplete-option-${opt.value}`}
              >
                {tableColumns.map((col) => (
                  <td
                    key={col.field}
                    className={cn(
                      "px-3 py-1.5",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                  >
                    {opt.data?.[col.field] != null
                      ? String(opt.data[col.field])
                      : col.field === "label"
                        ? opt.label
                        : ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );

    // -----------------------------------------------------------------------
    // Render option (card view)
    // -----------------------------------------------------------------------

    const renderCardView = () => (
      <div className="grid grid-cols-2 gap-2 p-2">
        {filteredOptions.map((opt, index) => {
          const isSelected = internalState.selectedValues.includes(opt.value);
          const isHighlighted = index === internalState.highlightedIndex;

          return (
            <button
              key={String(opt.value)}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded border border-[var(--color-border)] transition-colors cursor-pointer text-center",
                isHighlighted && "bg-[var(--color-bg-secondary)]",
                isSelected &&
                  "border-[var(--color-border-focus)] bg-[var(--color-bg-secondary)]",
                opt.disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => handleOptionSelect(opt)}
              onMouseEnter={() => dispatch({ type: "HIGHLIGHT", index })}
              data-testid={`autocomplete-option-${opt.value}`}
            >
              {opt.image && (
                <img
                  src={opt.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium truncate w-full">
                {opt.label}
              </span>
              {opt.description && (
                <span className="text-xs text-[var(--color-text-tertiary)] truncate w-full">
                  {opt.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );

    const hasValue =
      internalState.selectedValues.length > 0 ||
      internalState.inputValue.length > 0;

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

        {/* AICInput + Dropdown container */}
        <div
          ref={containerRef}
          className="relative w-full"
          onKeyDown={handleKeyDown}
        >
          {/* Hidden native input for form submission */}
          {name && (
            <input
              type="hidden"
              name={name}
              value={
                internalState.selectedValues.length > 0
                  ? internalState.selectedValues.join(",")
                  : ""
              }
            />
          )}

          {/* AICInput wrapper */}
          <div className={inputWrapperClasses}>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)] min-w-0"
              placeholder={placeholder}
              value={internalState.inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              readOnly={readOnly}
              id={id}
              aria-label={ariaLabel ?? label ?? "AICAutocomplete"}
              aria-expanded={internalState.isOpen}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-invalid={hasError || undefined}
              data-testid="autocomplete-input"
            />

            {/* Clear button */}
            {hasValue && !disabled && !readOnly && (
              <button
                type="button"
                className="shrink-0 p-0.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                onClick={handleClear}
                aria-label="Clear"
                data-testid="autocomplete-clear"
              >
                <ClearIcon />
              </button>
            )}

            {isLoading && <SpinnerIcon />}
          </div>

          {/* Dropdown */}
          {internalState.isOpen && (
            <div
              className="absolute left-0 top-full z-10 mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
              role="listbox"
              data-testid="autocomplete-dropdown"
            >
              <div className="max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <SpinnerIcon />
                  </div>
                ) : viewMode === "table" && tableColumns.length > 0 ? (
                  renderTableView()
                ) : viewMode === "card" ? (
                  renderCardView()
                ) : (
                  filteredOptions.map((opt, idx) =>
                    renderGeneralOption(opt, idx),
                  )
                )}

                {!isLoading && filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-[var(--color-text-tertiary)]">
                    {internalState.inputValue.length < minChars
                      ? `Type at least ${minChars} character${minChars > 1 ? "s" : ""}`
                      : "No results found"}
                  </div>
                )}
              </div>
            </div>
          )}
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

AICAutocomplete.displayName = "AICAutocomplete";
