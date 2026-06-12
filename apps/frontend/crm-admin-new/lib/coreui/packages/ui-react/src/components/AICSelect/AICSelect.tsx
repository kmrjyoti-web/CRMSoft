/**
 * React AICSelect component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";

import {
  getSelectTriggerStyles,
  getSelectDropdownStyles,
  getSelectOptionStyles,
  getSelectTagStyles,
  getSelectErrorStyles,
  getSelectWrapperStyles,
  getSelectTriggerA11yProps,
  getSelectListboxA11yProps,
  getSelectOptionA11yProps,
  getSelectKeyboardHandlers,
  selectReducer,
  initialSelectState,
  getFilteredOptions,
  getGroupedOptions,
} from "@coreui/ui";

import type {
  SelectOption,
  SelectSize,
  SelectAction,
  SelectInternalState,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICSelect props.
 * The component also accepts common HTML div attributes on the outer wrapper.
 */
export interface SelectProps {
  /** List of options to display in the dropdown. */
  options: SelectOption[];
  /** Currently selected value(s). A string for single select, string[] for multiple. */
  value?: string | string[];
  /** Size preset. */
  size?: SelectSize;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Whether the select is in an error state. */
  error?: boolean;
  /** Error message displayed below the select. */
  errorMessage?: string;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Whether to show a search input inside the dropdown. */
  searchable?: boolean;
  /** Whether to show a clear button to reset the selection. */
  clearable?: boolean;
  /** Whether multiple values can be selected. */
  multiple?: boolean;
  /** Whether the options are currently loading. */
  loading?: boolean;
  /** Maximum height of the dropdown panel (CSS value). */
  maxHeight?: string;
  /** Additional CSS class name(s) for the trigger. */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute (for form submission). */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler providing the new value(s). */
  onChange?: (value: string | string[]) => void;
}

// ---------------------------------------------------------------------------
// SVG icon components (inline to avoid external deps)
// ---------------------------------------------------------------------------

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="animate-spin text-[var(--color-text-tertiary)]"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICSelect built on the shared core logic from `@coreui/ui`.
 *
 * Uses `React.forwardRef` so consumers can attach refs to the outer
 * wrapper element.
 */
export const AICSelect = React.forwardRef<HTMLDivElement, SelectProps>(
  (props, ref) => {
    const {
      options,
      value: controlledValue,
      size = "md",
      placeholder = "AICSelect...",
      error = false,
      errorMessage,
      disabled = false,
      searchable = false,
      clearable = false,
      multiple = false,
      loading = false,
      maxHeight = "256px",
      className,
      id,
      name,
      ariaLabel,
      onChange,
    } = props;

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    const [internalState, dispatch] = useReducer(selectReducer, {
      ...initialSelectState,
      selectedValues: controlledValue
        ? Array.isArray(controlledValue)
          ? controlledValue
          : [controlledValue]
        : [],
    });

    // Sync internal state with controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        const newValues = Array.isArray(controlledValue)
          ? controlledValue
          : [controlledValue];
        const currentStr = internalState.selectedValues.join(",");
        const newStr = newValues.join(",");
        if (currentStr !== newStr) {
          // Reset selected values to match controlled prop
          dispatch({ type: "CLEAR" });
          // Re-set from controlled value by dispatching selects
          // Simpler: directly set via a controlled approach
          for (const val of newValues) {
            const opt = options.find((o) => o.value === val);
            if (opt) {
              dispatch({ type: "SELECT", option: opt, multiple: true });
            }
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue, options]);

    const selectedValues = controlledValue !== undefined
      ? Array.isArray(controlledValue)
        ? controlledValue
        : controlledValue ? [controlledValue] : []
      : internalState.selectedValues;

    // -----------------------------------------------------------------------
    // Refs
    // -----------------------------------------------------------------------

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // -----------------------------------------------------------------------
    // Filtered & grouped options
    // -----------------------------------------------------------------------

    const filteredOptions = useMemo(
      () => getFilteredOptions(options, internalState.searchQuery),
      [options, internalState.searchQuery],
    );

    const hasGroups = useMemo(
      () => options.some((o) => o.group),
      [options],
    );

    const groupedOptions = useMemo(
      () => (hasGroups ? getGroupedOptions(filteredOptions) : null),
      [hasGroups, filteredOptions],
    );

    // Build a flat list to track indices correctly when groups are present
    const flatFilteredOptions = filteredOptions;

    // -----------------------------------------------------------------------
    // Click outside
    // -----------------------------------------------------------------------

    useEffect(() => {
      if (!internalState.isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          dispatch({ type: "CLOSE" });
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [internalState.isOpen]);

    // Focus the search input when dropdown opens
    useEffect(() => {
      if (internalState.isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [internalState.isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (internalState.highlightedIndex >= 0) {
        const el = optionRefs.current.get(internalState.highlightedIndex);
        if (el) {
          el.scrollIntoView({ block: "nearest" });
        }
      }
    }, [internalState.highlightedIndex]);

    // -----------------------------------------------------------------------
    // Derived state
    // -----------------------------------------------------------------------

    const selectedOptions = useMemo(
      () => options.filter((o) => selectedValues.includes(o.value)),
      [options, selectedValues],
    );

    const displayLabel = useMemo(() => {
      if (selectedOptions.length === 0) return "";
      if (multiple) return "";
      return selectedOptions[0].label;
    }, [selectedOptions, multiple]);

    // -----------------------------------------------------------------------
    // Keyboard handler map
    // -----------------------------------------------------------------------

    const keyMap = useMemo(() => getSelectKeyboardHandlers(), []);

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleTriggerClick = useCallback(() => {
      if (disabled) return;
      dispatch({ type: "TOGGLE" });
    }, [disabled]);

    const handleTriggerKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;

        const handler = keyMap[e.key];
        if (!handler) return;

        e.preventDefault();

        switch (handler.actionType) {
          case "HIGHLIGHT_NEXT":
            if (!internalState.isOpen) {
              dispatch({ type: "OPEN" });
            } else {
              dispatch({ type: "HIGHLIGHT_NEXT", options: flatFilteredOptions });
            }
            break;

          case "HIGHLIGHT_PREV":
            if (!internalState.isOpen) {
              dispatch({ type: "OPEN" });
            } else {
              dispatch({ type: "HIGHLIGHT_PREV", options: flatFilteredOptions });
            }
            break;

          case "SELECT":
            if (
              internalState.isOpen &&
              internalState.highlightedIndex >= 0 &&
              internalState.highlightedIndex < flatFilteredOptions.length
            ) {
              const option = flatFilteredOptions[internalState.highlightedIndex];
              if (!option.disabled) {
                dispatch({ type: "SELECT", option, multiple });
                const newValues = multiple
                  ? selectedValues.includes(option.value)
                    ? selectedValues.filter((v) => v !== option.value)
                    : [...selectedValues, option.value]
                  : [option.value];
                onChange?.(multiple ? newValues : newValues[0]);
              }
            } else if (!internalState.isOpen) {
              dispatch({ type: "OPEN" });
            }
            break;

          case "CLOSE":
            dispatch({ type: "CLOSE" });
            triggerRef.current?.focus();
            break;

          case "HIGHLIGHT_INDEX":
            if (internalState.isOpen) {
              const index = handler.payload === "first"
                ? 0
                : flatFilteredOptions.length - 1;
              dispatch({ type: "HIGHLIGHT_INDEX", index });
            }
            break;
        }
      },
      [
        disabled,
        keyMap,
        internalState.isOpen,
        internalState.highlightedIndex,
        flatFilteredOptions,
        multiple,
        selectedValues,
        onChange,
      ],
    );

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "SEARCH", query: e.target.value });
      },
      [],
    );

    const handleSearchKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const handler = keyMap[e.key];
        if (!handler) return;

        if (handler.actionType === "HIGHLIGHT_NEXT") {
          e.preventDefault();
          dispatch({ type: "HIGHLIGHT_NEXT", options: flatFilteredOptions });
        } else if (handler.actionType === "HIGHLIGHT_PREV") {
          e.preventDefault();
          dispatch({ type: "HIGHLIGHT_PREV", options: flatFilteredOptions });
        } else if (handler.actionType === "SELECT") {
          if (
            internalState.highlightedIndex >= 0 &&
            internalState.highlightedIndex < flatFilteredOptions.length
          ) {
            e.preventDefault();
            const option = flatFilteredOptions[internalState.highlightedIndex];
            if (!option.disabled) {
              dispatch({ type: "SELECT", option, multiple });
              const newValues = multiple
                ? selectedValues.includes(option.value)
                  ? selectedValues.filter((v) => v !== option.value)
                  : [...selectedValues, option.value]
                : [option.value];
              onChange?.(multiple ? newValues : newValues[0]);
              if (!multiple) {
                triggerRef.current?.focus();
              }
            }
          }
        } else if (handler.actionType === "CLOSE") {
          e.preventDefault();
          dispatch({ type: "CLOSE" });
          triggerRef.current?.focus();
        } else if (handler.actionType === "HIGHLIGHT_INDEX") {
          e.preventDefault();
          const index = handler.payload === "first"
            ? 0
            : flatFilteredOptions.length - 1;
          dispatch({ type: "HIGHLIGHT_INDEX", index });
        }
      },
      [
        keyMap,
        flatFilteredOptions,
        internalState.highlightedIndex,
        multiple,
        selectedValues,
        onChange,
      ],
    );

    const handleOptionClick = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        dispatch({ type: "SELECT", option, multiple });

        const newValues = multiple
          ? selectedValues.includes(option.value)
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value]
          : [option.value];

        onChange?.(multiple ? newValues : newValues[0]);

        if (!multiple) {
          triggerRef.current?.focus();
        }
      },
      [multiple, selectedValues, onChange],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        dispatch({ type: "CLEAR" });
        onChange?.(multiple ? [] : "");
        triggerRef.current?.focus();
      },
      [disabled, multiple, onChange],
    );

    const handleTagRemove = useCallback(
      (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        const option = options.find((o) => o.value === value);
        if (option) {
          dispatch({ type: "SELECT", option, multiple: true });
          const newValues = selectedValues.filter((v) => v !== value);
          onChange?.(newValues);
        }
      },
      [disabled, options, selectedValues, onChange],
    );

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const wrapperClasses = getSelectWrapperStyles();

    const triggerClasses = getSelectTriggerStyles({
      size,
      disabled,
      error,
      isOpen: internalState.isOpen,
      className,
    });

    const dropdownClasses = getSelectDropdownStyles();
    const errorClasses = getSelectErrorStyles();
    const tagClasses = getSelectTagStyles();

    const triggerA11y = getSelectTriggerA11yProps({
      isOpen: internalState.isOpen,
      disabled,
      id,
      ariaLabel,
      multiple,
    });

    const listboxA11y = getSelectListboxA11yProps({ id });

    // -----------------------------------------------------------------------
    // Render helpers
    // -----------------------------------------------------------------------

    const setOptionRef = useCallback(
      (index: number, el: HTMLDivElement | null) => {
        if (el) {
          optionRefs.current.set(index, el);
        } else {
          optionRefs.current.delete(index);
        }
      },
      [],
    );

    const renderOption = (option: SelectOption, flatIndex: number) => {
      const isSelected = selectedValues.includes(option.value);
      const isHighlighted = internalState.highlightedIndex === flatIndex;
      const optionA11y = getSelectOptionA11yProps({
        id,
        index: flatIndex,
        isSelected,
        isDisabled: option.disabled,
      });

      return (
        <div
          key={option.value}
          ref={(el) => setOptionRef(flatIndex, el)}
          className={getSelectOptionStyles(option, isSelected, isHighlighted)}
          onClick={() => handleOptionClick(option)}
          onMouseEnter={() =>
            !option.disabled &&
            dispatch({ type: "HIGHLIGHT_INDEX", index: flatIndex })
          }
          {...optionA11y}
        >
          <span className="flex-1 truncate">{option.label}</span>
          {isSelected && (
            <span className="ml-2 text-[var(--color-primary)]">
              <CheckIcon />
            </span>
          )}
        </div>
      );
    };

    const renderOptions = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center py-4">
            <SpinnerIcon />
            <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">
              Loading...
            </span>
          </div>
        );
      }

      if (flatFilteredOptions.length === 0) {
        return (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-[var(--color-text-tertiary)]">
              No options
            </span>
          </div>
        );
      }

      // Grouped rendering
      if (groupedOptions) {
        let flatIndex = 0;

        return groupedOptions.map((group) => (
          <div key={group.group || "__ungrouped__"}>
            {group.group && (
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {group.group}
              </div>
            )}
            {group.options.map((option) => {
              // Find the flat index for this option in filteredOptions
              const currentFlatIndex = flatFilteredOptions.indexOf(option);
              const idx = currentFlatIndex >= 0 ? currentFlatIndex : flatIndex;
              flatIndex++;
              return renderOption(option, idx);
            })}
          </div>
        ));
      }

      // Flat rendering
      return flatFilteredOptions.map((option, index) =>
        renderOption(option, index),
      );
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div ref={ref} className={wrapperClasses}>
        {/* Hidden native select for form submission */}
        {name && (
          <select
            name={name}
            multiple={multiple}
            value={multiple ? selectedValues : selectedValues[0] ?? ""}
            onChange={() => {}}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          >
            <option value="" />
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          className={triggerClasses}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          {...triggerA11y}
        >
          {/* Value display area */}
          <span className="flex flex-1 items-center gap-1 overflow-hidden min-w-0">
            {multiple && selectedOptions.length > 0 ? (
              /* Multi-select tags */
              <span className="flex flex-wrap items-center gap-1">
                {selectedOptions.map((opt) => (
                  <span key={opt.value} className={tagClasses}>
                    <span className="truncate">{opt.label}</span>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--color-bg)] transition-colors"
                      onClick={(e) => handleTagRemove(opt.value, e)}
                      aria-label={`Remove ${opt.label}`}
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
              </span>
            ) : displayLabel ? (
              <span className="truncate">{displayLabel}</span>
            ) : (
              <span className="truncate text-[var(--color-text-tertiary)]">
                {placeholder}
              </span>
            )}
          </span>

          {/* Right-side icons */}
          <span className="flex shrink-0 items-center gap-1 ml-2">
            {/* Loading spinner in trigger */}
            {loading && <SpinnerIcon />}

            {/* Clear button */}
            {clearable && selectedValues.length > 0 && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                className="inline-flex items-center justify-center p-0.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <CloseIcon />
              </span>
            )}

            {/* Chevron */}
            <ChevronDownIcon
              className={`text-[var(--color-text-tertiary)] transition-transform ${
                internalState.isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {/* Dropdown panel */}
        {internalState.isOpen && (
          <div ref={dropdownRef} className={dropdownClasses}>
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-[var(--color-border)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
                  placeholder="Search..."
                  value={internalState.searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search options"
                  aria-autocomplete="list"
                />
              </div>
            )}

            {/* Options list */}
            <div
              style={{ maxHeight }}
              className="overflow-y-auto"
              {...listboxA11y}
            >
              {renderOptions()}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && errorMessage && (
          <span
            id={id ? `${id}-error` : undefined}
            className={errorClasses}
            role="alert"
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

AICSelect.displayName = "AICSelect";
