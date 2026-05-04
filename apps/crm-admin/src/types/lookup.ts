// ── Lookup Value (API response shape) ──────────────────

export interface LookupValue {
  id: string;
  label: string;
  value: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
}
