"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icon";

// ══════════════════════════════════════════════════════════════
//  SmartSearch — Shared Autocomplete with Field Keys,
//  Wildcards, Multi-Filter Chaining & Display Modes
// ══════════════════════════════════════════════════════════════

// ── Public types ─────────────────────────────────────────────

/** Describes one searchable field on the entity */
export interface SmartSearchField {
  /** 2-letter CAPS shortcut, e.g. "NM", "PC", "CM" */
  key: string;
  /** Human label shown in field picker, e.g. "Product Name" */
  label: string;
  /** Dot-path or function to extract value from an item */
  accessor: string | ((item: any) => string);
  /** If true this field is searched when user types without a field key */
  isDefault?: boolean;
}

/** One active filter chip */
export interface ActiveFilter {
  fieldKey: string;
  value: string;
  wildcard: "contains" | "startsWith" | "endsWith" | "exact";
}

/** Display mode */
export type SmartSearchDisplayMode = "list" | "card" | "table";

/** Column definition for table display mode */
export interface SmartSearchColumn<T = any> {
  key: string;
  header: string;
  accessor: string | ((item: T) => ReactNode);
  width?: string;
}

/** Main component props — generic over item type T */
export interface SmartSearchProps<T = any> {
  /** Data items to search through */
  items: T[];
  /** Searchable field definitions */
  fields: SmartSearchField[];
  /** How to get a unique id from each item */
  idAccessor: string | ((item: T) => string);
  /** Currently selected item id */
  value?: string | null;
  /** Called when selection changes */
  onChange?: (value: string | null) => void;
  /** Called with full item data on select */
  onSelect?: (item: T | null) => void;

  // ── Display ──
  /** Display mode for dropdown results (default: "list") */
  displayMode?: SmartSearchDisplayMode;
  /** Allow user to toggle display mode (default: false) */
  allowModeSwitch?: boolean;
  /** Custom list item renderer */
  renderListItem?: (item: T, isSelected: boolean, isHighlighted: boolean) => ReactNode;
  /** Custom card renderer */
  renderCardItem?: (item: T, isSelected: boolean) => ReactNode;
  /** Columns for table mode */
  tableColumns?: SmartSearchColumn<T>[];

  // ── Appearance ──
  label?: string;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  /** Footer below dropdown */
  footer?: ReactNode;
  /** Max items shown in dropdown (default: 50) */
  maxResults?: number;
  /** Min dropdown width (default: 360) */
  minDropdownWidth?: number;
  /** Function to format selected value display text */
  formatSelected?: (item: T) => string;
}

// ── Utility helpers ──────────────────────────────────────────

function getNestedValue(obj: any, path: string): string {
  const val = path.split(".").reduce((o, k) => o?.[k], obj);
  return val != null ? String(val) : "";
}

function getFieldValue(item: any, accessor: string | ((item: any) => string)): string {
  if (typeof accessor === "function") return accessor(item);
  return getNestedValue(item, accessor);
}

function getId<T>(item: T, idAccessor: string | ((item: T) => string)): string {
  if (typeof idAccessor === "function") return idAccessor(item);
  return getNestedValue(item, idAccessor);
}

/** Parse wildcard pattern:
 *  "%%term" or "term" → contains (default)
 *  "%term" → endsWith
 *  "term%" → startsWith
 *  "=term" → exact match
 */
function parseWildcard(raw: string): { value: string; wildcard: ActiveFilter["wildcard"] } {
  const trimmed = raw.trim();
  if (trimmed.startsWith("=")) {
    return { value: trimmed.slice(1), wildcard: "exact" };
  }
  if (trimmed.startsWith("%%")) {
    return { value: trimmed.slice(2), wildcard: "contains" };
  }
  if (trimmed.startsWith("%") && !trimmed.endsWith("%")) {
    return { value: trimmed.slice(1), wildcard: "endsWith" };
  }
  if (trimmed.endsWith("%") && !trimmed.startsWith("%")) {
    return { value: trimmed.slice(0, -1), wildcard: "startsWith" };
  }
  // Default: contains
  return { value: trimmed.replace(/%/g, ""), wildcard: "contains" };
}

/** Test a value against a wildcard filter */
function matchWildcard(fieldValue: string, filterValue: string, wildcard: ActiveFilter["wildcard"]): boolean {
  const fv = fieldValue.toLowerCase();
  const sv = filterValue.toLowerCase();
  if (!sv) return true;
  switch (wildcard) {
    case "exact":
      return fv === sv;
    case "startsWith":
      return fv.startsWith(sv);
    case "endsWith":
      return fv.endsWith(sv);
    case "contains":
    default:
      return fv.includes(sv);
  }
}

/** Parse the full input text into active filters.
 *  Format: "NM:widget PC:ABC" or just "widget" (uses default fields)
 *  The LAST token (if no colon) is the "live" search term.
 */
function parseInput(
  raw: string,
  fields: SmartSearchField[],
): { filters: ActiveFilter[]; liveField: string | null; liveValue: string } {
  const filters: ActiveFilter[] = [];
  // Split by spaces but preserve quoted strings
  const tokens = raw.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  let liveField: string | null = null;
  let liveValue = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const colonIdx = token.indexOf(":");
    if (colonIdx > 0) {
      const key = token.substring(0, colonIdx).toUpperCase();
      const val = token.substring(colonIdx + 1).replace(/"/g, "");
      const field = fields.find((f) => f.key === key);
      if (field) {
        const parsed = parseWildcard(val);
        if (i === tokens.length - 1) {
          // Last token with colon — this is the "live" one being typed
          liveField = key;
          liveValue = parsed.value;
        } else {
          filters.push({ fieldKey: key, ...parsed });
        }
        continue;
      }
    }
    // No colon or unknown key — treat as live search
    if (i === tokens.length - 1) {
      // Check if it starts with a known 2-letter key
      const upper = token.toUpperCase();
      const matchedField = fields.find(
        (f) => upper.startsWith(f.key) && upper.length > f.key.length,
      );
      if (matchedField) {
        const rest = token.substring(matchedField.key.length);
        const parsed = parseWildcard(rest);
        liveField = matchedField.key;
        liveValue = parsed.value;
      } else {
        liveValue = token;
      }
    } else {
      // Middle token without key — apply to default fields
      const parsed = parseWildcard(token);
      filters.push({ fieldKey: "__default__", ...parsed });
    }
  }

  return { filters, liveField, liveValue };
}

// ── Wildcard badge label ─────────────────────────────────────

const wildcardLabels: Record<ActiveFilter["wildcard"], string> = {
  contains: "%%",
  startsWith: "…%",
  endsWith: "%…",
  exact: "=",
};

// ══════════════════════════════════════════════════════════════
//  SmartSearch Component
// ══════════════════════════════════════════════════════════════

export function SmartSearch<T = any>({
  items,
  fields,
  idAccessor,
  value,
  onChange,
  onSelect,
  displayMode: initialDisplayMode = "list",
  allowModeSwitch = false,
  renderListItem,
  renderCardItem,
  tableColumns,
  label,
  placeholder,
  error,
  errorMessage,
  disabled,
  loading,
  required,
  footer,
  maxResults = 50,
  minDropdownWidth = 360,
  formatSelected,
}: SmartSearchProps<T>) {
  // ── State ────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [displayMode, setDisplayMode] = useState<SmartSearchDisplayMode>(initialDisplayMode);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldPickerRef = useRef<HTMLDivElement>(null);

  // ── Derived ──────────────────────────────────────────────

  const defaultFields = useMemo(
    () => fields.filter((f) => f.isDefault),
    [fields],
  );

  const selectedItem = useMemo(
    () => (value ? items.find((it) => getId(it, idAccessor) === value) ?? null : null),
    [items, value, idAccessor],
  );

  const displayValue = useMemo(() => {
    if (isOpen) return inputText;
    if (!selectedItem) return "";
    if (formatSelected) return formatSelected(selectedItem);
    // Fallback: use first default field
    if (defaultFields.length > 0) {
      return getFieldValue(selectedItem, defaultFields[0].accessor);
    }
    return getId(selectedItem, idAccessor);
  }, [isOpen, inputText, selectedItem, formatSelected, defaultFields, idAccessor]);

  // ── Filtering logic ──────────────────────────────────────

  const { filters, liveField, liveValue } = useMemo(
    () => parseInput(inputText, fields),
    [inputText, fields],
  );

  const filtered = useMemo(() => {
    if (!inputText.trim()) return items.slice(0, maxResults);

    let result = items;

    // Apply committed filters
    for (const f of filters) {
      result = result.filter((item) => {
        if (f.fieldKey === "__default__") {
          // Match against any default field
          return defaultFields.some((df) => {
            const val = getFieldValue(item, df.accessor);
            return matchWildcard(val, f.value, f.wildcard);
          });
        }
        const field = fields.find((fd) => fd.key === f.fieldKey);
        if (!field) return true;
        const val = getFieldValue(item, field.accessor);
        return matchWildcard(val, f.value, f.wildcard);
      });
    }

    // Apply live search term
    if (liveValue) {
      result = result.filter((item) => {
        if (liveField) {
          const field = fields.find((f) => f.key === liveField);
          if (!field) return true;
          const val = getFieldValue(item, field.accessor);
          return matchWildcard(val, liveValue, "contains");
        }
        // Search all default fields
        return defaultFields.some((df) => {
          const val = getFieldValue(item, df.accessor);
          return matchWildcard(val, liveValue, "contains");
        });
      });
    }

    return result.slice(0, maxResults);
  }, [items, inputText, filters, liveField, liveValue, fields, defaultFields, maxResults]);

  const hasValue = value != null && value !== "";
  const isFloating = isOpen || hasValue;

  // ── Effects ──────────────────────────────────────────────

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filtered]);

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      if (fieldPickerRef.current?.contains(t)) return;
      setIsOpen(false);
      setInputText("");
      setShowFieldPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Dropdown position
  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      setDropdownPos(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, minDropdownWidth),
    });
  }, [isOpen, minDropdownWidth]);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-smart-item]");
    const el = items[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  // ── Handlers ─────────────────────────────────────────────

  const handleSelect = useCallback(
    (item: T) => {
      const id = getId(item, idAccessor);
      onChange?.(id);
      onSelect?.(item);
      setIsOpen(false);
      setInputText("");
      setShowFieldPicker(false);
      inputRef.current?.blur();
    },
    [onChange, onSelect, idAccessor],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      onSelect?.(null);
      setInputText("");
    },
    [onChange, onSelect],
  );

  const handleFieldPickerSelect = useCallback(
    (fieldKey: string) => {
      const current = inputText.trimEnd();
      const newText = current ? `${current} ${fieldKey}:` : `${fieldKey}:`;
      setInputText(newText);
      setShowFieldPicker(false);
      inputRef.current?.focus();
    },
    [inputText],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Shift+Space → toggle field picker
      if (e.key === " " && e.shiftKey) {
        e.preventDefault();
        setShowFieldPicker((prev) => !prev);
        return;
      }

      if (showFieldPicker) {
        if (e.key === "Escape") {
          setShowFieldPicker(false);
          return;
        }
        // Let field picker handle its own keys
        return;
      }

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setInputText("");
          inputRef.current?.blur();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
            handleSelect(filtered[highlightedIndex]);
          }
          break;
      }
    },
    [isOpen, filtered, highlightedIndex, handleSelect, showFieldPicker],
  );

  // ── Active filter chips ──────────────────────────────────

  const filterChips = useMemo(() => {
    return filters.map((f, i) => {
      const field = f.fieldKey === "__default__"
        ? { key: "ALL", label: "All" }
        : fields.find((fd) => fd.key === f.fieldKey) ?? { key: f.fieldKey, label: f.fieldKey };
      return (
        <span
          key={`${f.fieldKey}-${i}`}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-medium whitespace-nowrap"
        >
          <span className="font-bold">{field.key}</span>
          <span className="text-gray-400">{wildcardLabels[f.wildcard]}</span>
          <span className="truncate max-w-[80px]">{f.value}</span>
        </span>
      );
    });
  }, [filters, fields]);

  // ── Render helpers ───────────────────────────────────────

  const renderDefaultListItem = (item: T, isSelected: boolean, _isHighlighted: boolean) => {
    const primary = defaultFields[0]
      ? getFieldValue(item, defaultFields[0].accessor)
      : getId(item, idAccessor);
    const secondary = defaultFields[1]
      ? getFieldValue(item, defaultFields[1].accessor)
      : "";
    return (
      <div className="flex items-center gap-2 w-full min-w-0">
        <span className="text-sm truncate">
          {primary}
          {secondary && (
            <span className="text-gray-400 ml-1">({secondary})</span>
          )}
        </span>
        {isSelected && (
          <Icon
            name="check"
            size={14}
            className="ml-auto text-[var(--color-primary)] flex-shrink-0"
          />
        )}
      </div>
    );
  };

  const renderDefaultCardItem = (item: T, isSelected: boolean) => {
    return (
      <div className="flex flex-col gap-1 p-2 w-full min-w-0">
        {defaultFields.map((df, i) => (
          <div key={df.key} className={i === 0 ? "font-medium text-sm" : "text-xs text-gray-500"}>
            <span className="text-[10px] text-gray-400 mr-1">{df.label}:</span>
            {getFieldValue(item, df.accessor)}
          </div>
        ))}
        {isSelected && (
          <Icon
            name="check"
            size={14}
            className="absolute top-2 right-2 text-[var(--color-primary)]"
          />
        )}
      </div>
    );
  };

  const renderTableMode = () => {
    const cols: SmartSearchColumn<T>[] = tableColumns ?? defaultFields.map((df) => ({
      key: df.key,
      header: df.label,
      accessor: df.accessor,
    }));

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-500 uppercase"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const id = getId(item, idAccessor);
              const isSelected = id === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <tr
                  key={id}
                  data-smart-item
                  className={[
                    "cursor-pointer transition-colors",
                    isSelected
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : isHighlighted
                        ? "bg-[var(--color-bg-secondary)]"
                        : "hover:bg-[var(--color-bg-secondary)]",
                  ].join(" ")}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {cols.map((col) => (
                    <td key={col.key} className="px-2 py-1.5 truncate max-w-[160px]">
                      {typeof col.accessor === "function"
                        ? col.accessor(item)
                        : getNestedValue(item, col.accessor)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Styles ───────────────────────────────────────────────

  const triggerCls = [
    "flex items-center gap-1.5 rounded-[var(--radius-md)] border min-h-[32px] px-3 transition-all cursor-text",
    "bg-[var(--color-bg)] text-[var(--color-text)]",
    disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "",
    error
      ? "border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20"
      : isOpen
        ? "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20"
        : "border-[var(--color-border)] hover:border-gray-400",
  ]
    .filter(Boolean)
    .join(" ");

  const labelCls = label
    ? [
        "absolute bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[80%]",
        isFloating
          ? [
              "z-[2] top-0 -translate-y-1/2 text-[11px] left-2",
              error
                ? "text-red-500"
                : isOpen
                  ? "text-[var(--color-primary)]"
                  : "text-gray-500",
            ].join(" ")
          : "z-[1] top-1/2 -translate-y-1/2 text-sm text-gray-400 left-9",
      ].join(" ")
    : "";

  const defaultPlaceholder = placeholder ?? `Search... (Shift+Space for field keys)`;

  // ── Render ───────────────────────────────────────────────

  return (
    <div>
      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <div
          className={triggerCls}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          <span className="flex-shrink-0 text-gray-400">
            <Icon name="search" size={15} />
          </span>

          {/* Filter chips */}
          {filters.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {filterChips}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:text-[var(--color-text-tertiary)]"
            value={displayValue}
            onChange={(e) => {
              setInputText(e.target.value);
              if (!isOpen) setIsOpen(true);
              setShowFieldPicker(false);
            }}
            onFocus={() => {
              if (disabled) return;
              setIsOpen(true);
              setInputText("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={!label || isFloating ? defaultPlaceholder : ""}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
          />

          {/* Clear */}
          {hasValue && !disabled && !loading && (
            <button
              type="button"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
            >
              <Icon name="x" size={14} />
            </button>
          )}

          {/* Loading or chevron */}
          {loading ? (
            <Icon
              name="loader"
              size={14}
              className="flex-shrink-0 text-gray-400 animate-spin"
            />
          ) : (
            <span
              className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              <Icon name="chevron-down" size={14} />
            </span>
          )}
        </div>

        {/* Floating label */}
        {label && (
          <label className={labelCls}>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* ── Field Picker Popup (Shift+Space) ─── */}
        {showFieldPicker &&
          isOpen &&
          !disabled &&
          dropdownPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={fieldPickerRef}
              className="fixed z-[10000] rounded-[var(--radius-md)] border border-[var(--color-primary)]/30 bg-[var(--color-bg)] py-1 shadow-xl"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: Math.min(dropdownPos.width, 280),
              }}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-100">
                Field Keys — click to add filter
              </div>
              {fields.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                  onClick={() => handleFieldPickerSelect(f.key)}
                >
                  <span className="font-mono font-bold text-[var(--color-primary)] text-xs w-6">
                    {f.key}
                  </span>
                  <span className="text-gray-600">{f.label}</span>
                  {f.isDefault && (
                    <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      default
                    </span>
                  )}
                </button>
              ))}
              <div className="px-3 py-1.5 text-[10px] text-gray-400 border-t border-gray-100">
                Wildcards: <span className="font-mono">%%</span> contains · <span className="font-mono">term%</span> starts · <span className="font-mono">%term</span> ends · <span className="font-mono">=term</span> exact
              </div>
            </div>,
            document.body,
          )}

        {/* ── Dropdown (portal) ─── */}
        {isOpen &&
          !disabled &&
          !showFieldPicker &&
          dropdownPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={listRef}
              className="fixed z-[9999] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg max-h-[300px] overflow-y-auto"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
              role="listbox"
            >
              {/* Search hints toolbar */}
              <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100">
                <span className="text-[10px] text-gray-400">
                  {inputText
                    ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                    : `${Math.min(items.length, maxResults)} of ${items.length} items`}
                  {" · "}
                  <span className="font-mono">Shift+Space</span> field keys
                </span>
                {allowModeSwitch && (
                  <div className="flex items-center gap-0.5">
                    {(["list", "card", "table"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={[
                          "p-1 rounded transition-colors",
                          displayMode === m
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "text-gray-400 hover:text-gray-600",
                        ].join(" ")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDisplayMode(m);
                        }}
                        title={m}
                      >
                        <Icon
                          name={m === "list" ? "list" : m === "card" ? "layout-grid" : "table"}
                          size={12}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-400">
                  <Icon name="loader" size={16} className="animate-spin" />
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  No results found
                </div>
              ) : displayMode === "table" ? (
                renderTableMode()
              ) : displayMode === "card" ? (
                <div className="grid grid-cols-2 gap-1 p-1">
                  {filtered.map((item, idx) => {
                    const id = getId(item, idAccessor);
                    const isSelected = id === value;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-smart-item
                        className={[
                          "relative rounded-[var(--radius-md)] border text-left transition-colors cursor-pointer",
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "border-transparent hover:bg-[var(--color-bg-secondary)]",
                        ].join(" ")}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {renderCardItem
                          ? renderCardItem(item, isSelected)
                          : renderDefaultCardItem(item, isSelected)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* list mode */
                filtered.map((item, idx) => {
                  const id = getId(item, idAccessor);
                  const isSelected = id === value;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="option"
                      data-smart-item
                      aria-selected={isSelected}
                      className={[
                        "flex w-full items-start px-3 py-2 text-left transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : isHighlighted
                            ? "bg-[var(--color-bg-secondary)]"
                            : "hover:bg-[var(--color-bg-secondary)]",
                      ].join(" ")}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      {renderListItem
                        ? renderListItem(item, isSelected, isHighlighted)
                        : renderDefaultListItem(item, isSelected, isHighlighted)}
                    </button>
                  );
                })
              )}
            </div>,
            document.body,
          )}
      </div>

      {/* Error */}
      {error && errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}

      {/* Footer */}
      {footer}
    </div>
  );
}
