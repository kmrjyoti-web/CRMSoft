// ── Department Types ─────────────────────────────────────

export interface DepartmentItem {
  id: string;
  tenantId: string;
  name: string;
  displayName: string;
  code: string;
  description?: string | null;
  level: number;
  path?: string | null;
  parentId?: string | null;
  headUserId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDetail extends DepartmentItem {
  parent?: DepartmentItem | null;
  children?: DepartmentItem[];
  headUser?: { id: string; firstName: string; lastName: string } | null;
  designations?: { id: string; name: string; code: string }[];
}

export interface DepartmentCreateData {
  name: string;
  displayName: string;
  code: string;
  description?: string;
  level?: number;
  parentId?: string;
  headUserId?: string;
}

export interface DepartmentUpdateData {
  name?: string;
  displayName?: string;
  code?: string;
  description?: string;
  level?: number;
  parentId?: string;
  headUserId?: string;
}

export interface DepartmentListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
