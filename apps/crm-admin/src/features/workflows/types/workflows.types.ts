// ── Workflow Enums ────────────────────────────────────────

export type WorkflowEntityType =
  | "LEAD"
  | "QUOTATION"
  | "INVOICE"
  | "INSTALLATION"
  | "TICKET";

export type WorkflowStateType = "INITIAL" | "INTERMEDIATE" | "TERMINAL";

export type WorkflowStateCategory = "SUCCESS" | "FAILURE" | "PAUSED";

export type WorkflowTriggerType = "MANUAL" | "AUTO" | "SCHEDULED" | "APPROVAL";

// ── Workflow State ───────────────────────────────────────

export interface WorkflowState {
  id: string;
  workflowId: string;
  name: string;
  code: string;
  stateType: WorkflowStateType;
  category?: WorkflowStateCategory | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Workflow Transition ──────────────────────────────────

export interface WorkflowTransition {
  id: string;
  workflowId: string;
  fromStateId: string;
  toStateId: string;
  name: string;
  code: string;
  triggerType: WorkflowTriggerType;
  conditions?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
  requiredPermission?: string | null;
  requiredRole?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Workflow ─────────────────────────────────────────────

export interface WorkflowItem {
  id: string;
  name: string;
  code: string;
  entityType: WorkflowEntityType;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  isPublished: boolean;
  version: number;
  configJson?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowListItem extends WorkflowItem {
  _count?: {
    states: number;
    transitions: number;
  };
}

export interface WorkflowDetail extends WorkflowItem {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

// ── Visual Diagram Data ──────────────────────────────────

export interface VisualNode {
  id: string;
  label: string;
  stateType: WorkflowStateType;
  category?: WorkflowStateCategory | null;
  color?: string | null;
  icon?: string | null;
  x: number;
  y: number;
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  triggerType: WorkflowTriggerType;
}

export interface WorkflowVisualData {
  nodes: VisualNode[];
  edges: VisualEdge[];
}

// ── Validation Result ────────────────────────────────────

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Mutation DTOs ────────────────────────────────────────

export interface WorkflowCreateData {
  name: string;
  code: string;
  entityType: WorkflowEntityType;
  description?: string;
  isDefault?: boolean;
  configJson?: Record<string, unknown>;
}

export interface WorkflowUpdateData {
  name?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  configJson?: Record<string, unknown>;
}

export interface WorkflowStateCreateData {
  name: string;
  code: string;
  stateType: WorkflowStateType;
  category?: WorkflowStateCategory;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface WorkflowStateUpdateData {
  name?: string;
  category?: WorkflowStateCategory;
  color?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface WorkflowTransitionCreateData {
  fromStateId: string;
  toStateId: string;
  name: string;
  code: string;
  triggerType?: WorkflowTriggerType;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  requiredPermission?: string;
  requiredRole?: string;
}

export interface WorkflowTransitionUpdateData {
  name?: string;
  triggerType?: WorkflowTriggerType;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  requiredPermission?: string;
  requiredRole?: string;
  isActive?: boolean;
}

// ── Query Params ─────────────────────────────────────────

export interface WorkflowListParams {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: WorkflowEntityType;
  sortOrder?: "asc" | "desc";
}
