export interface ColumnConfig {
  id: string;
  label?: string;
  visible: boolean;
  order: number;
  width?: number;
  pinned?: "left" | "right" | null;
}

export interface FilterLayoutSection {
  title: string;
  filterIds: string[];
}

export interface TableConfigData {
  columns: ColumnConfig[];
  density?: "compact" | "cozy" | "comfortable";
  defaultViewMode?: string;
  pageSize?: number;
  showRowActions?: boolean;
  filterVisibility?: Record<string, boolean>;
  /** Custom filter grouping + ordering (overrides static filterConfig sections) */
  filterLayout?: FilterLayoutSection[];
}

export interface TableConfigRecord {
  id: string;
  tenantId: string;
  tableKey: string;
  userId: string | null;
  config: TableConfigData;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTableConfigPayload {
  config: TableConfigData;
  applyToAll?: boolean;
}

export interface MaskingPolicy {
  id: string;
  tableKey: string;
  columnId: string;
  roleId?: string | null;
  userId?: string | null;
  maskType: "FULL" | "PARTIAL" | "NONE";
  canUnmask: boolean;
  isActive: boolean;
  role?: { id: string; displayName: string } | null;
}

export interface MaskingMeta {
  [columnId: string]: { masked: boolean; canUnmask: boolean };
}

export interface CreateMaskingPolicyData {
  tableKey: string;
  columnId: string;
  roleId?: string;
  userId?: string;
  maskType: "FULL" | "PARTIAL" | "NONE";
  canUnmask?: boolean;
}

export interface UpdateMaskingPolicyData {
  maskType?: "FULL" | "PARTIAL" | "NONE";
  canUnmask?: boolean;
  isActive?: boolean;
}

export interface UnmaskRequest {
  tableKey: string;
  columnId: string;
  recordId: string;
}
