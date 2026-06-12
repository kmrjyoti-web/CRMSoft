// ── Entities ─────────────────────────────────────────────

export interface SavedFilter {
  id: string;
  userId: string;
  name: string;
  description?: string;
  entityType: string;
  filters: FilterCondition[];
  filterLogic?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCondition {
  id?: string;
  field: string;
  operator: "eq" | "neq" | "contains" | "starts_with" | "ends_with" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "is_null" | "is_not_null" | "between" | "within_days";
  value: unknown;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateSavedFilterDto {
  name: string;
  description?: string;
  entityType: string;
  filters: Omit<FilterCondition, "id">[];
  filterLogic?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isPublic?: boolean;
}

export interface EntityFilterAssignDto {
  lookupValueIds: string[];
}

export interface FilterSearchDto {
  lookupValueIds: string[];
  matchAll?: boolean;
}
