// ── Enums ─────────────────────────────────────────────────

export type DemoMode = "ONLINE" | "OFFLINE";

export type DemoStatus =
  | "SCHEDULED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type DemoResult =
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "FOLLOW_UP"
  | "NO_SHOW";

// ── Base ─────────────────────────────────────────────────

export interface DemoItem {
  id: string;
  mode: DemoMode;
  status: DemoStatus;
  scheduledAt: string;
  completedAt?: string | null;
  duration?: number | null;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
  outcome?: string | null;
  result?: DemoResult | null;
  rescheduleCount: number;
  cancelReason?: string | null;
  noShowReason?: string | null;
  leadId: string;
  conductedById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export interface DemoLead {
  id: string;
  leadNumber: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface DemoConductedBy {
  id: string;
  firstName: string;
  lastName: string;
}

// ── List item (paginated) ────────────────────────────────

export interface DemoListItem extends DemoItem {
  lead?: DemoLead | null;
  conductedBy?: DemoConductedBy | null;
}

// ── Detail (single fetch) ────────────────────────────────

export interface DemoDetail extends DemoItem {
  lead?: DemoLead | null;
  conductedBy?: DemoConductedBy | null;
}

// ── Mutations ────────────────────────────────────────────

export interface DemoCreateData {
  mode: DemoMode;
  scheduledAt: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  leadId: string;
  conductedById?: string;
}

export interface DemoUpdateData {
  mode?: DemoMode;
  scheduledAt?: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
}

export interface DemoRescheduleData {
  scheduledAt: string;
  reason?: string;
}

export interface DemoCompleteData {
  result: DemoResult;
  outcome?: string;
  notes?: string;
}

export interface DemoCancelData {
  cancelReason: string;
}

// ── Query params ─────────────────────────────────────────

export interface DemoListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: DemoStatus;
  mode?: DemoMode;
  conductedById?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}
