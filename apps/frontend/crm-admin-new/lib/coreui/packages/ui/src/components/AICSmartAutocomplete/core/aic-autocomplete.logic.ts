/**
 * AICAutocomplete logic.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Provides query parsing, helper items building, keyboard mapping,
 * selection label building, and request construction.
 */

import type {
  AutocompleteSourceConfig,
  AutocompleteFieldConfig,
  AutoCompleteSearchParam,
  HelperItem,
  FieldHelperItem,
  WildcardHelperItem,
  AutocompleteKeyAction,
  AICAutocompleteFeatureFlags,
  AutocompleteSelectionConfig,
} from "./aic-autocomplete.types";

// ── Default Feature Flags ───────────────────
export const DEFAULT_FEATURE_FLAGS: AICAutocompleteFeatureFlags = {
  shiftHelperEnabled: true,
  fieldBadgesEnabled: true,
  shortcutsEnabled: true,
};

export function resolveFeatureFlags(
  flags: Partial<AICAutocompleteFeatureFlags> | null | undefined
): AICAutocompleteFeatureFlags {
  return { ...DEFAULT_FEATURE_FLAGS, ...(flags ?? {}) };
}

// ── Query Parsing ───────────────────────────
export function parseQuery(
  query: string,
  config: AutocompleteSourceConfig
): AutoCompleteSearchParam[] {
  if (!query.trim()) return [];

  const filters: AutoCompleteSearchParam[] = [];
  // Parse patterns like "CODE:value" or "CODE:!value" or "CODE:*value*"
  const regex = /(\w+):(!?)(\*?)([^*\s]+)(\*?)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(query)) !== null) {
    const [, code, not, startWild, value, endWild] = match;
    const field = config.fields.find(
      (f) => f.code.toLowerCase() === code.toLowerCase()
    );
    if (!field) continue;

    let wildcard = field.defaultWildcard ?? "AUTO";
    if (startWild && endWild) wildcard = "CONTAINS";
    else if (startWild) wildcard = "ENDS_WITH";
    else if (endWild) wildcard = "STARTS_WITH";

    filters.push({
      parameter_code: field.code,
      parameter_name: field.parameterName,
      conditional_operator: not ? "NOT" : "AND",
      wildcard_operator: wildcard,
      parameter_value: value,
    });
  }

  // If no structured filters found, create a general search
  if (filters.length === 0 && query.trim()) {
    const defaultField = config.fields[0];
    if (defaultField) {
      filters.push({
        parameter_code: defaultField.code,
        parameter_name: defaultField.parameterName,
        conditional_operator: "AND",
        wildcard_operator: "CONTAINS",
        parameter_value: query.trim(),
      });
    }
  }

  return filters;
}

// ── Helper Items Builder ────────────────────
export function buildHelperItems(
  config: AutocompleteSourceConfig
): HelperItem[] {
  const items: HelperItem[] = [];

  // Field items
  for (const field of config.fields) {
    items.push({
      type: "field",
      code: field.code,
      label: `${field.label} (${field.code}:)`,
    });
  }

  // Wildcard items
  const wildcards: Array<{ wildKind: string; label: string }> = [
    { wildKind: "CONTAINS", label: "Contains (*value*)" },
    { wildKind: "STARTS_WITH", label: "Starts with (value*)" },
    { wildKind: "ENDS_WITH", label: "Ends with (*value)" },
    { wildKind: "EXACT", label: "Exact match (value)" },
  ];

  for (const wc of wildcards) {
    items.push({
      type: "wildcard",
      wildKind: wc.wildKind,
      label: wc.label,
    });
  }

  return items;
}

// ── Helper Navigation ───────────────────────
export function moveHelperSelection(
  current: number | null,
  items: HelperItem[],
  direction: 1 | -1
): number {
  if (items.length === 0) return 0;
  if (current === null) return direction === 1 ? 0 : items.length - 1;
  const next = current + direction;
  if (next < 0) return items.length - 1;
  if (next >= items.length) return 0;
  return next;
}

export function isFieldItem(item: HelperItem): item is FieldHelperItem {
  return item.type === "field";
}

// ── Keyboard Mapping ────────────────────────
export function mapKeyToAutocompleteAction(
  event: KeyboardEvent
): AutocompleteKeyAction {
  if (event.key === "ArrowDown") return "moveDown";
  if (event.key === "ArrowUp") return "moveUp";
  if (event.key === "Enter") return "select";
  if (event.key === "F2") return "toggleHelper";
  if (event.shiftKey && event.key === " ") return "toggleHelper";
  if (event.key === "Escape") return "closeHelper";
  return "none";
}

// ── Selection Label Builder ─────────────────
export function buildSelectionLabel(
  row: unknown,
  config: AutocompleteSourceConfig | null
): string {
  if (!row || !config) return "";
  const obj = row as Record<string, unknown>;
  const selCfg = config.selectionConfig;

  if (selCfg?.displayFields && selCfg.displayFields.length > 0) {
    const sep = selCfg.displaySeparator ?? " - ";
    return selCfg.displayFields
      .map((f) => String(obj[f] ?? ""))
      .filter(Boolean)
      .join(sep);
  }

  if (selCfg?.displayField) {
    return String(obj[selCfg.displayField] ?? "");
  }

  // Fallback to first field
  if (config.fields.length > 0) {
    const firstCode = config.fields[0].code;
    return String(obj[firstCode] ?? "");
  }

  return String(row);
}

// ── Request Builder ─────────────────────────
export function buildAutocompleteRequest(
  filters: AutoCompleteSearchParam[],
  baseFilters: Record<string, unknown>,
  take: number
): {
  take: number;
  base_filters: Record<string, unknown>[];
  search_filters: AutoCompleteSearchParam[];
} {
  const base = Object.entries(baseFilters).map(([key, value]) => ({
    [key]: value,
  }));

  return {
    take,
    base_filters: base,
    search_filters: filters,
  };
}

// ── Placeholder Builder ─────────────────────
export function buildPlaceholder(
  config: AutocompleteSourceConfig | null,
  controlConfig?: { placeholder?: string } | null
): string {
  if (controlConfig?.placeholder) return controlConfig.placeholder;
  if (!config) return "Search...";
  const codes = config.fields.map((f) => f.code).join(", ");
  return `Search (codes: ${codes})`;
}
