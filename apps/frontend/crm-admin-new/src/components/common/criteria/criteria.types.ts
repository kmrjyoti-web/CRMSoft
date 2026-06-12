// ── Field type determines which operators are available ──

export type CriteriaFieldType = "string" | "number" | "date" | "select" | "lookup";

export interface CriteriaFieldDef {
  key: string;
  label: string;
  type: CriteriaFieldType;
  options?: { label: string; value: string }[];
  lookupConfig?: {
    endpoint: string;
    labelKey: string;
    valueKey: string;
  };
}

export interface CriteriaRowData {
  id: string;
  field: string;
  operator: string;
  value: unknown;
  value2?: unknown;
}

// ── Operator definition ──

export interface OperatorDef {
  value: string;
  label: string;
  /** Preset operators need no value input (e.g. "Today", "is empty") */
  preset?: boolean;
  /** Operator that requires two value inputs (e.g. "between") */
  range?: boolean;
}

// ── Operators by field type ──

export const STRING_OPERATORS: OperatorDef[] = [
  { value: "is", label: "is" },
  { value: "isnt", label: "isn't" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "doesn't contain" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "is_empty", label: "is empty", preset: true },
  { value: "is_not_empty", label: "is not empty", preset: true },
];

export const NUMBER_OPERATORS: OperatorDef[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "between", label: "between", range: true },
  { value: "not_between", label: "not between", range: true },
  { value: "is_empty", label: "is empty", preset: true },
  { value: "is_not_empty", label: "is not empty", preset: true },
];

export const DATE_OPERATORS: OperatorDef[] = [
  { value: "is", label: "is" },
  { value: "isnt", label: "isn't" },
  { value: "is_before", label: "is before" },
  { value: "is_after", label: "is after" },
  { value: "between", label: "between", range: true },
  { value: "not_between", label: "not between", range: true },
  // Preset values — no value input needed
  { value: "today", label: "Today", preset: true },
  { value: "tomorrow", label: "Tomorrow", preset: true },
  { value: "yesterday", label: "Yesterday", preset: true },
  { value: "till_yesterday", label: "Till Yesterday", preset: true },
  { value: "previous_month", label: "Previous Month", preset: true },
  { value: "current_month", label: "Current Month", preset: true },
  { value: "next_month", label: "Next Month", preset: true },
  { value: "previous_week", label: "Previous Week", preset: true },
  { value: "current_week", label: "Current Week", preset: true },
  { value: "next_week", label: "Next Week", preset: true },
  { value: "this_year", label: "This Year", preset: true },
  { value: "current_fy", label: "Current FY", preset: true },
  { value: "current_fq", label: "Current FQ", preset: true },
  { value: "previous_fy", label: "Previous FY", preset: true },
  { value: "previous_fq", label: "Previous FQ", preset: true },
  { value: "next_year", label: "Next Year", preset: true },
  { value: "next_fy", label: "Next FY", preset: true },
  { value: "next_fq", label: "Next FQ", preset: true },
  { value: "is_empty", label: "is empty", preset: true },
  { value: "is_not_empty", label: "is not empty", preset: true },
];

export const SELECT_OPERATORS: OperatorDef[] = [
  { value: "is", label: "is" },
  { value: "isnt", label: "isn't" },
  { value: "is_empty", label: "is empty", preset: true },
  { value: "is_not_empty", label: "is not empty", preset: true },
];

export const LOOKUP_OPERATORS: OperatorDef[] = [
  { value: "is", label: "is" },
  { value: "isnt", label: "isn't" },
  { value: "is_empty", label: "is empty", preset: true },
  { value: "is_not_empty", label: "is not empty", preset: true },
];

/** Get operators for a given field type */
export function getOperatorsForType(type: CriteriaFieldType): OperatorDef[] {
  switch (type) {
    case "string": return STRING_OPERATORS;
    case "number": return NUMBER_OPERATORS;
    case "date": return DATE_OPERATORS;
    case "select": return SELECT_OPERATORS;
    case "lookup": return LOOKUP_OPERATORS;
    default: return STRING_OPERATORS;
  }
}
