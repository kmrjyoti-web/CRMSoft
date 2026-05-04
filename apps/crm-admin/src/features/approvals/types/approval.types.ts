// ── Enums ────────────────────────────────────────────────

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── Entities ─────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId?: string;
  action: string;
  payload: Record<string, unknown>;
  makerId: string;
  maker?: { id: string; firstName: string; lastName: string; email: string };
  checkerId?: string;
  checker?: { id: string; firstName: string; lastName: string; email: string };
  checkerRole: string;
  status: ApprovalStatus;
  makerNote?: string;
  checkerNote?: string;
  expiresAt: string;
  decidedAt?: string;
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  entityType: string;
  action: string;
  checkerRole: string;
  minCheckers: number;
  skipForRoles: string[];
  amountField?: string;
  amountThreshold?: number;
  expiryHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowApproval {
  id: string;
  instanceId: string;
  instance?: {
    id: string;
    entityType: string;
    entityId: string;
    currentStateId: string;
    currentState?: { name: string; color?: string };
  };
  transitionId: string;
  transition?: {
    id: string;
    name: string;
    fromState?: { name: string };
    toState?: { name: string };
  };
  requestedById: string;
  requestedBy?: { firstName: string; lastName: string };
  approvedById?: string;
  approvedBy?: { firstName: string; lastName: string };
  status: ApprovalStatus;
  comment?: string;
  expiresAt?: string;
  decidedAt?: string;
  createdAt: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface SubmitApprovalDto {
  entityType: string;
  entityId?: string;
  action: string;
  payload?: Record<string, unknown>;
  makerNote?: string;
}

export interface ApproveRejectDto {
  note?: string;
}

export interface CreateApprovalRuleDto {
  entityType: string;
  action: string;
  checkerRole: string;
  minCheckers?: number;
  skipForRoles?: string[];
  amountField?: string;
  amountThreshold?: number;
  expiryHours?: number;
}

export interface ApprovalFilters {
  status?: ApprovalStatus;
  entityType?: string;
  page?: number;
  limit?: number;
}
