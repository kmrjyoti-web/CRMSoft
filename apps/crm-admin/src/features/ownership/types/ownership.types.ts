// ── Enums ────────────────────────────────────────────────

export type EntityType = "RAW_CONTACT" | "CONTACT" | "ORGANIZATION" | "LEAD" | "QUOTATION" | "TICKET" | "PRODUCT";
export type OwnerType = "PRIMARY_OWNER" | "CO_OWNER" | "WATCHER" | "DELEGATED_OWNER" | "TEAM_OWNER";
export type OwnershipAction = "ASSIGN" | "TRANSFER" | "REVOKE" | "DELEGATE" | "AUTO_REVERT" | "ROTATION" | "ESCALATION";
export type AssignmentMethod = "MANUAL" | "ROUND_ROBIN" | "RULE_BASED" | "WORKLOAD_BALANCE" | "ESCALATION" | "AUTO_REVERT";
export type AssignmentRuleStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type LoadStatus = "OPTIMAL" | "OVERLOADED" | "UNDERUTILIZED";

// ── Entities ─────────────────────────────────────────────

export interface EntityOwner {
  id: string;
  entityType: EntityType;
  entityId: string;
  ownerType: OwnerType;
  userId?: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  assignedById: string;
  assignmentReason?: string;
  priority: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OwnershipLog {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: OwnershipAction;
  ownerType: OwnerType;
  fromUserId?: string;
  fromUser?: { firstName: string; lastName: string };
  toUserId?: string;
  toUser?: { firstName: string; lastName: string };
  reasonCode: string;
  reasonDetail?: string;
  changedById: string;
  isAutomated: boolean;
  createdAt: string;
}

export interface DelegationRecord {
  id: string;
  fromUserId: string;
  fromUser?: { firstName: string; lastName: string; email: string };
  toUserId: string;
  toUser?: { firstName: string; lastName: string; email: string };
  entityType?: EntityType;
  startDate: string;
  endDate: string;
  reason: string;
  isActive: boolean;
  isReverted: boolean;
  createdAt: string;
}

export interface UserCapacity {
  id: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string };
  maxLeads: number;
  maxContacts: number;
  maxOrganizations: number;
  maxQuotations: number;
  maxTotal: number;
  activeLeads: number;
  activeContacts: number;
  activeOrganizations: number;
  activeQuotations: number;
  activeTotal: number;
  isAvailable: boolean;
  unavailableFrom?: string;
  unavailableTo?: string;
  delegateToId?: string;
  avgResponseHours?: number;
  conversionRate?: number;
  lastActivityAt?: string;
}

export interface AssignmentRule {
  id: string;
  name: string;
  description?: string;
  entityType: EntityType;
  triggerEvent: string;
  conditions: Record<string, unknown>;
  assignmentMethod: AssignmentMethod;
  assignToUserId?: string;
  assignToTeamIds?: string[];
  assignToRoleId?: string;
  ownerType: OwnerType;
  maxPerUser?: number;
  respectWorkload: boolean;
  escalateAfterHours?: number;
  priority: number;
  status: AssignmentRuleStatus;
  executionCount: number;
  lastExecutedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkloadDashboard {
  members: UserCapacity[];
  totalEntities: number;
  averageLoad: number;
}

export interface RebalanceSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  entityType: EntityType;
  count: number;
  reason: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface AssignOwnerDto {
  entityType: EntityType;
  entityId: string;
  userId: string;
  ownerType?: OwnerType;
  reason?: string;
  reasonDetail?: string;
}

export interface TransferOwnerDto {
  entityType: EntityType;
  entityId: string;
  fromUserId: string;
  toUserId: string;
  ownerType?: OwnerType;
  reason?: string;
  reasonDetail?: string;
}

export interface DelegateOwnershipDto {
  fromUserId: string;
  toUserId: string;
  startDate: string;
  endDate: string;
  reason: string;
  entityType?: EntityType;
}

export interface BulkAssignDto {
  entityType: EntityType;
  entityIds: string[];
  userId: string;
  ownerType?: OwnerType;
  reason?: string;
}

export interface UpdateCapacityDto {
  maxLeads?: number;
  maxContacts?: number;
  maxOrganizations?: number;
  maxQuotations?: number;
  maxTotal?: number;
}
