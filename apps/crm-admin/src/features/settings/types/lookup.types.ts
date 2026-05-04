// ── Lookup Master ────────────────────────────────────────

export interface LookupListItem {
  id: string;
  category: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    values: number;
  };
}

export interface LookupValueItem {
  id: string;
  lookupId: string;
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  rowIndex: number;
  isDefault: boolean;
  isActive: boolean;
  parentId?: string | null;
  configJson?: unknown;
}

export interface LookupDetail extends LookupListItem {
  values: LookupValueItem[];
}

export interface LookupCreateData {
  category: string;
  displayName: string;
  description?: string;
  isSystem?: boolean;
}

export interface LookupUpdateData {
  displayName?: string;
  description?: string;
}

// ── Lookup Value CRUD ────────────────────────────────────

export interface LookupValueCreateData {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  parentId?: string;
  configJson?: unknown;
}

export interface LookupValueUpdateData {
  label?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface LookupListParams {
  activeOnly?: boolean;
  [key: string]: unknown;
}
