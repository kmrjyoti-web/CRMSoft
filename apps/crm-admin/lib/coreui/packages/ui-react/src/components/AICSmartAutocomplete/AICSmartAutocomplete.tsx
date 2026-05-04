/**
 * React AICAutocomplete component.
 * Advanced autocomplete with multiple view modes (general/table/cards),
 * operator-based query parsing, keyboard navigation, and helper dropdown.
 *
 * Source: aic-autocomplete-core logic in @coreui/ui
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
  parseQuery,
  buildHelperItems,
  moveHelperSelection,
  isFieldItem,
  mapKeyToAutocompleteAction,
  buildSelectionLabel,
  buildAutocompleteRequest,
  buildPlaceholder,
  resolveFeatureFlags,
} from "@coreui/ui";

import type {
  AICAutocompleteProps,
  AutocompleteSourceConfig,
  AICAutocompleteControlConfig,
  AutoCompleteSearchParam,
  HelperItem,
  AICAutocompleteViewMode,
  AutocompleteTableColumn,
} from "@coreui/ui";

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
    data-testid="aic-autocomplete-spinner"
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

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICSmartAutocomplete = React.forwardRef<
  HTMLDivElement,
  AICAutocompleteProps
>((props, ref) => {
  const {
    sourceConfig,
    controlConfig,
    value,
    label,
    icon,
    required = false,
    baseFilters,
    className,
    onSelect,
    onAddNew,
    onReset,
    onChange,
  } = props;

  // ── Resolved Config ─────────────────────────
  const featureFlags = useMemo(
    () => resolveFeatureFlags(sourceConfig.featureFlags),
    [sourceConfig.featureFlags]
  );

  const effectiveViewMode: AICAutocompleteViewMode =
    controlConfig?.viewMode ?? sourceConfig.viewMode ?? "general";

  const minLength = controlConfig?.minLength ?? 1;
  const isReadOnly = controlConfig?.readonly ?? false;
  const showClear =
    controlConfig?.showClear ?? sourceConfig.showClear ?? true;
  const debounceMs = 400;

  const placeholder = useMemo(
    () => buildPlaceholder(sourceConfig, controlConfig),
    [sourceConfig, controlConfig]
  );

  // ── State ─────────────────────────────────
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [helperDropdownOpen, setHelperDropdownOpen] = useState(false);
  const [helperActiveIndex, setHelperActiveIndex] = useState<number | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<
    AutoCompleteSearchParam[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Derived ─────────────────────────────────
  const helperItems = useMemo(
    () => buildHelperItems(sourceConfig),
    [sourceConfig]
  );

  // ── Refs ──────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Sync controlled value to input display ────
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const label = buildSelectionLabel(value, sourceConfig);
      setQuery(label);
    }
  }, [value, sourceConfig]);

  // ── Close on outside click ────────────────
  useEffect(() => {
    if (!panelOpen && !helperDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
        setHelperDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen, helperDropdownOpen]);

  // ── Search Execution ──────────────────────
  const executeSearch = useCallback(
    async (searchQuery: string) => {
      const filters = parseQuery(searchQuery, sourceConfig);
      setActiveFilters(filters);

      if (filters.length === 0 && !searchQuery.trim()) {
        setItems([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const mergedBaseFilters = {
          ...(sourceConfig.baseFilters ?? {}),
          ...(baseFilters ?? {}),
          ...(controlConfig?.overrideBaseFilters ?? {}),
        };

        const take = sourceConfig.takeDefault ?? 10;

        if (sourceConfig.fetchFn) {
          const payload = buildAutocompleteRequest(
            filters,
            mergedBaseFilters,
            take
          );
          const result = await sourceConfig.fetchFn({
            query: searchQuery,
            payload,
          });
          const resultItems = Array.isArray(result) ? result : [];
          setItems(resultItems as Record<string, unknown>[]);
        } else {
          // No fetchFn — no results
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [sourceConfig, baseFilters, controlConfig?.overrideBaseFilters]
  );

  // ── Debounced AICInput Handler ───────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      setHighlightedIndex(-1);

      if (!panelOpen) {
        setPanelOpen(true);
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.length >= minLength) {
        debounceRef.current = setTimeout(() => {
          executeSearch(val);
        }, debounceMs);
      } else {
        setItems([]);
        setActiveFilters([]);
        setHasSearched(false);
      }
    },
    [panelOpen, minLength, debounceMs, executeSearch]
  );

  // ── Selection Handler ─────────────────────
  const handleItemSelect = useCallback(
    (row: Record<string, unknown>) => {
      const label = buildSelectionLabel(row, sourceConfig);
      setQuery(label);
      setPanelOpen(false);
      setHelperDropdownOpen(false);
      setHighlightedIndex(-1);
      onSelect?.(row);
      onChange?.(row);
    },
    [sourceConfig, onSelect, onChange]
  );

  // ── Clear Handler ─────────────────────────
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setQuery("");
      setItems([]);
      setActiveFilters([]);
      setHasSearched(false);
      setPanelOpen(false);
      setHighlightedIndex(-1);
      onReset?.();
      onChange?.(null);
      inputRef.current?.focus();
    },
    [onReset, onChange]
  );

  // ── Focus Handler ─────────────────────────
  const handleFocus = useCallback(() => {
    if (query.length >= minLength) {
      setPanelOpen(true);
    }
  }, [query, minLength]);

  // ── Helper Dropdown Handlers ──────────────
  const toggleHelper = useCallback(() => {
    setHelperDropdownOpen((prev) => !prev);
    setHelperActiveIndex(null);
  }, []);

  const handleHelperSelect = useCallback(
    (item: HelperItem) => {
      if (isFieldItem(item)) {
        const newQuery = query + item.code + ":";
        setQuery(newQuery);
        inputRef.current?.focus();
      }
      setHelperDropdownOpen(false);
      setHelperActiveIndex(null);
    },
    [query]
  );

  // ── Keyboard Handler ──────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isReadOnly) return;

      // Map the event using our core keyboard mapper
      const nativeEvent = e.nativeEvent as KeyboardEvent;
      const action = mapKeyToAutocompleteAction(nativeEvent);

      // Helper dropdown navigation
      if (helperDropdownOpen) {
        if (action === "moveDown") {
          e.preventDefault();
          setHelperActiveIndex((prev) =>
            moveHelperSelection(prev, helperItems, 1)
          );
          return;
        }
        if (action === "moveUp") {
          e.preventDefault();
          setHelperActiveIndex((prev) =>
            moveHelperSelection(prev, helperItems, -1)
          );
          return;
        }
        if (action === "select" && helperActiveIndex !== null) {
          e.preventDefault();
          handleHelperSelect(helperItems[helperActiveIndex]);
          return;
        }
        if (action === "closeHelper") {
          e.preventDefault();
          setHelperDropdownOpen(false);
          setHelperActiveIndex(null);
          return;
        }
      }

      // Toggle helper
      if (action === "toggleHelper" && featureFlags.shiftHelperEnabled) {
        e.preventDefault();
        toggleHelper();
        return;
      }

      // Panel navigation
      if (action === "moveDown") {
        e.preventDefault();
        if (!panelOpen) {
          setPanelOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : 0
          );
        }
        return;
      }

      if (action === "moveUp") {
        e.preventDefault();
        if (panelOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : items.length - 1
          );
        }
        return;
      }

      if (action === "select") {
        e.preventDefault();
        if (panelOpen && highlightedIndex >= 0 && highlightedIndex < items.length) {
          handleItemSelect(items[highlightedIndex]);
        }
        return;
      }

      if (action === "closeHelper") {
        e.preventDefault();
        setPanelOpen(false);
        setHelperDropdownOpen(false);
        return;
      }

      // Ctrl+N for add new
      if (e.ctrlKey && e.key === "n" && onAddNew) {
        e.preventDefault();
        onAddNew();
        return;
      }
    },
    [
      isReadOnly,
      helperDropdownOpen,
      helperActiveIndex,
      helperItems,
      handleHelperSelect,
      featureFlags.shiftHelperEnabled,
      toggleHelper,
      panelOpen,
      items,
      highlightedIndex,
      handleItemSelect,
      onAddNew,
    ]
  );

  // ── Table Columns ─────────────────────────
  const tableColumns = sourceConfig.tableColumns ?? [];

  // ── Render: General View ──────────────────
  const renderGeneralView = () => (
    <div data-testid="aic-autocomplete-general-view">
      {items.map((row, index) => {
        const label = buildSelectionLabel(row, sourceConfig);
        const isHighlighted = index === highlightedIndex;

        return (
          <button
            key={index}
            type="button"
            role="option"
            aria-selected={isHighlighted}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer",
              isHighlighted && "bg-[var(--color-bg-secondary)]"
            )}
            onClick={() => handleItemSelect(row)}
            onMouseEnter={() => setHighlightedIndex(index)}
            data-testid={`aic-autocomplete-item-${index}`}
          >
            <span className="flex-1 truncate">{highlightText(label, query)}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Render: Table View ────────────────────
  const renderTableView = () => (
    <div data-testid="aic-autocomplete-table-view">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {tableColumns.map((col) => (
              <th
                key={col.field}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => {
            const isHighlighted = index === highlightedIndex;

            return (
              <tr
                key={index}
                role="option"
                aria-selected={isHighlighted}
                className={cn(
                  "cursor-pointer transition-colors",
                  isHighlighted && "bg-[var(--color-bg-secondary)]"
                )}
                onClick={() => handleItemSelect(row)}
                onMouseEnter={() => setHighlightedIndex(index)}
                data-testid={`aic-autocomplete-item-${index}`}
              >
                {tableColumns.map((col) => (
                  <td
                    key={col.field}
                    className={cn(
                      "px-3 py-1.5",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.columnType === "IMAGE" ? (
                      <img
                        src={String(row[col.field] ?? "")}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      String(row[col.field] ?? "")
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Render: Card View ─────────────────────
  const renderCardView = () => {
    const headerCol = tableColumns.find((c) => c.cardHeader);
    const cardRows = tableColumns
      .filter((c) => c.cardRow)
      .sort((a, b) => (a.cardOrder ?? 0) - (b.cardOrder ?? 0));

    return (
      <div
        className="grid grid-cols-2 gap-2 p-2"
        data-testid="aic-autocomplete-cards-view"
      >
        {items.map((row, index) => {
          const isHighlighted = index === highlightedIndex;

          return (
            <button
              key={index}
              type="button"
              role="option"
              aria-selected={isHighlighted}
              className={cn(
                "flex flex-col gap-1 p-3 rounded border border-[var(--color-border)] transition-colors cursor-pointer text-left",
                isHighlighted &&
                  "bg-[var(--color-bg-secondary)] border-[var(--color-border-focus)]"
              )}
              onClick={() => handleItemSelect(row)}
              onMouseEnter={() => setHighlightedIndex(index)}
              data-testid={`aic-autocomplete-item-${index}`}
            >
              {headerCol && (
                <span className="text-sm font-medium truncate">
                  {String(row[headerCol.field] ?? "")}
                </span>
              )}
              {cardRows.map((cr) => (
                <span
                  key={cr.field}
                  className="text-xs text-[var(--color-text-tertiary)] truncate"
                >
                  {cr.cardLabel ? `${cr.cardLabel}: ` : ""}
                  {String(row[cr.field] ?? "")}
                </span>
              ))}
              {!headerCol && cardRows.length === 0 && (
                <span className="text-sm truncate">
                  {buildSelectionLabel(row, sourceConfig)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Render: Helper Dropdown ───────────────
  const renderHelperDropdown = () => {
    if (!helperDropdownOpen) return null;

    return (
      <div
        className="absolute left-0 top-full z-20 mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
        data-testid="aic-autocomplete-helper"
        role="listbox"
      >
        <div className="px-3 py-1 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider border-b border-[var(--color-border)]">
          Search Fields &amp; Operators
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {helperItems.map((item, index) => {
            const isActive = index === helperActiveIndex;
            return (
              <button
                key={`${item.type}-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors cursor-pointer",
                  isActive && "bg-[var(--color-bg-secondary)]"
                )}
                onClick={() => handleHelperSelect(item)}
                onMouseEnter={() => setHelperActiveIndex(index)}
                data-testid={`aic-autocomplete-helper-item-${index}`}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-medium",
                    item.type === "field"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  )}
                >
                  {item.type === "field" ? "F" : "W"}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-3 py-1 text-xs text-[var(--color-text-tertiary)] border-t border-[var(--color-border)]">
          Press F2 or Shift+Space to toggle
        </div>
      </div>
    );
  };

  // ── Render: Filter Badges ─────────────────
  const renderFilterBadges = () => {
    if (!featureFlags.fieldBadgesEnabled || activeFilters.length === 0)
      return null;

    return (
      <div
        className="flex flex-wrap gap-1 mt-1"
        data-testid="aic-autocomplete-filter-badges"
      >
        {activeFilters.map((filter, index) => (
          <span
            key={index}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              filter.conditional_operator === "NOT"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            )}
            data-testid={`aic-autocomplete-badge-${index}`}
          >
            <span className="font-semibold">{filter.parameter_code}</span>
            <span className="opacity-70">
              {filter.wildcard_operator?.toLowerCase()}
            </span>
            <span>{filter.parameter_value}</span>
          </span>
        ))}
      </div>
    );
  };

  // ── Panel panel content by view mode ──────
  const renderPanelContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <SpinnerIcon />
        </div>
      );
    }

    if (items.length === 0 && hasSearched) {
      return (
        <div className="px-3 py-3 text-sm text-[var(--color-text-tertiary)] text-center">
          No results found
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="px-3 py-3 text-sm text-[var(--color-text-tertiary)] text-center">
          {query.length < minLength
            ? `Type at least ${minLength} character${minLength > 1 ? "s" : ""}`
            : "Start typing to search"}
        </div>
      );
    }

    switch (effectiveViewMode) {
      case "table":
        return tableColumns.length > 0
          ? renderTableView()
          : renderGeneralView();
      case "cards":
        return renderCardView();
      default:
        return renderGeneralView();
    }
  };

  const hasValue = query.length > 0;

  // ── Panel dimensions ──────────────────────
  const panelStyle: React.CSSProperties = {};
  if (controlConfig?.panelWidth) panelStyle.width = controlConfig.panelWidth;
  if (controlConfig?.panelMaxHeight)
    panelStyle.maxHeight = controlConfig.panelMaxHeight;
  else if (sourceConfig.panelConfig?.maxHeight)
    panelStyle.maxHeight = sourceConfig.panelConfig.maxHeight;

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)} ref={ref}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            "text-sm font-medium text-[var(--color-text-secondary)]",
            required &&
              "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]"
          )}
          data-testid="aic-autocomplete-label"
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
        {/* AICInput wrapper */}
        <div
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] transition-colors",
            "focus-within:border-[var(--color-border-focus)] focus-within:ring-1 focus-within:ring-[var(--color-border-focus)]",
            isReadOnly && "opacity-70 pointer-events-none"
          )}
          data-testid="aic-autocomplete-input-wrapper"
        >
          {/* Icon */}
          {icon ? (
            <span
              className="shrink-0 text-[var(--color-text-tertiary)]"
              data-testid="aic-autocomplete-icon"
            >
              {icon}
            </span>
          ) : (
            <SearchIcon className="shrink-0 text-[var(--color-text-tertiary)]" />
          )}

          {/* AICInput */}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)] min-w-0 text-sm"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            readOnly={isReadOnly}
            aria-label={label ?? "AIC Autocomplete"}
            aria-expanded={panelOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            data-testid="aic-autocomplete-input"
          />

          {/* Clear button */}
          {showClear && hasValue && !isReadOnly && (
            <button
              type="button"
              className="shrink-0 p-0.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
              onClick={handleClear}
              aria-label="Clear"
              data-testid="aic-autocomplete-clear"
            >
              <ClearIcon />
            </button>
          )}

          {/* Loading indicator */}
          {loading && <SpinnerIcon />}

          {/* Helper toggle */}
          {featureFlags.shiftHelperEnabled && (
            <button
              type="button"
              className={cn(
                "shrink-0 p-0.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] transition-transform",
                helperDropdownOpen && "rotate-180"
              )}
              onClick={toggleHelper}
              aria-label="Toggle helper"
              data-testid="aic-autocomplete-helper-toggle"
            >
              <ChevronDownIcon />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        {controlConfig?.showFilterSummary !== false && renderFilterBadges()}

        {/* Helper Dropdown */}
        {renderHelperDropdown()}

        {/* Results Panel */}
        {panelOpen && !helperDropdownOpen && (
          <div
            ref={panelRef}
            className="absolute left-0 top-full z-10 mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg"
            role="listbox"
            style={panelStyle}
            data-testid="aic-autocomplete-panel"
          >
            <div
              className="overflow-y-auto"
              style={{ maxHeight: panelStyle.maxHeight ?? "280px" }}
            >
              {renderPanelContent()}
            </div>

            {/* Footer with Add New + count */}
            {(onAddNew || items.length > 0) && (
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
                <span>
                  {items.length > 0
                    ? `${items.length} result${items.length !== 1 ? "s" : ""}`
                    : ""}
                </span>
                {onAddNew && (
                  <button
                    type="button"
                    className="text-[var(--color-primary)] hover:underline cursor-pointer"
                    onClick={onAddNew}
                    data-testid="aic-autocomplete-add-new"
                  >
                    + Add New (Ctrl+N)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AICSmartAutocomplete.displayName = "AICSmartAutocomplete";

// ---------------------------------------------------------------------------
// Helper: Highlight matching text
// ---------------------------------------------------------------------------

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  // Extract the raw search term (strip field prefixes like "NAME:")
  const plainQuery = query.replace(/\w+:/g, "").replace(/[*!]/g, "").trim();
  if (!plainQuery) return text;

  const index = text.toLowerCase().indexOf(plainQuery.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 text-inherit rounded-sm px-0">
        {text.slice(index, index + plainQuery.length)}
      </mark>
      {text.slice(index + plainQuery.length)}
    </>
  );
}
