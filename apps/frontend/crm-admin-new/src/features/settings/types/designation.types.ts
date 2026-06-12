// ── Designation Types ────────────────────────────────────

export interface DesignationItem {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  level: number;
  grade?: string | null;
  departmentId?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignationDetail extends DesignationItem {
  department?: { id: string; name: string } | null;
  parent?: DesignationItem | null;
  children?: DesignationItem[];
}

export interface DesignationCreateData {
  name: string;
  code: string;
  description?: string;
  level?: number;
  grade?: string;
  departmentId?: string;
  parentId?: string;
}

export interface DesignationUpdateData {
  name?: string;
  code?: string;
  description?: string;
  level?: number;
  grade?: string;
  departmentId?: string;
  parentId?: string;
}

export interface DesignationListParams {
  search?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
