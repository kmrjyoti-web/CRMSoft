// ── Enums ─────────────────────────────────────────────────

export type LeadStatus =
  | "NEW"
  | "VERIFIED"
  | "ALLOCATED"
  | "IN_PROGRESS"
  | "DEMO_SCHEDULED"
  | "QUOTATION_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "ON_HOLD";

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ── Base ─────────────────────────────────────────────────

export interface LeadItem {
  id: string;
  leadNumber: string;
  status: LeadStatus;
  priority: LeadPriority;
  expectedValue?: number | null;
  expectedCloseDate?: string | null;
  lostReason?: string | null;
  notes?: string | null;
  contactId: string;
  organizationId?: string | null;
  allocatedToId?: string | null;
  allocatedAt?: string | null;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export interface LeadContact {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string | null;
  communications?: { type: string; value: string }[];
}

export interface LeadOrganization {
  id: string;
  name: string;
  city?: string | null;
}

export interface LeadAssignee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface LeadFilter {
  id: string;
  lookupValueId: string;
  lookupValue: {
    id: string;
    value: string;
    label: string;
  };
}

export interface LeadActivity {
  id: string;
  type: string;
  subject: string;
  outcome?: string | null;
  completedAt?: string | null;
  scheduledAt?: string | null;
}

// ── List item (paginated) ────────────────────────────────

export interface LeadListItem extends LeadItem {
  contact: LeadContact;
  organization?: LeadOrganization | null;
  allocatedTo?: LeadAssignee | null;
  filters?: LeadFilter[];
  _count?: {
    activities: number;
    demos: number;
    quotations: number;
  };
}

// ── Detail (single fetch) ────────────────────────────────

export interface LeadDetail extends LeadItem {
  contact: LeadContact;
  organization?: LeadOrganization | null;
  allocatedTo?: LeadAssignee | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  filters?: LeadFilter[];
  activities?: LeadActivity[];
  validNextStatuses: string[];
  isTerminal: boolean;
  _count?: {
    activities: number;
    demos: number;
    quotations: number;
  };
}

// ── Mutations ────────────────────────────────────────────

export interface LeadCreateData {
  contactId: string;
  organizationId?: string;
  priority?: LeadPriority;
  expectedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  filterIds?: string[];
}

export interface LeadUpdateData {
  priority?: LeadPriority;
  expectedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  filterIds?: string[];
}

// ── Query params ─────────────────────────────────────────

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: LeadStatus;
  priority?: LeadPriority;
  allocatedToId?: string;
  contactId?: string;
  organizationId?: string;
  [key: string]: unknown;
}
