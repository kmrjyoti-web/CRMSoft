// ── Enums ─────────────────────────────────────────────────

export type ActivityType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "NOTE"
  | "WHATSAPP"
  | "SMS"
  | "VISIT";

// ── Base ─────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string | null;
  outcome?: string | null;
  duration?: number | null;
  scheduledAt?: string | null;
  endTime?: string | null;
  completedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  isActive?: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export interface ActivityLead {
  id: string;
  leadNumber: string;
}

export interface ActivityContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ActivityCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
}

// ── List item (paginated) ────────────────────────────────

export interface ActivityListItem extends ActivityItem {
  lead?: ActivityLead | null;
  contact?: ActivityContact | null;
  createdBy?: ActivityCreatedBy | null;
}

// ── Detail (single fetch) ────────────────────────────────

export interface ActivityDetail extends ActivityItem {
  lead?: ActivityLead | null;
  contact?: ActivityContact | null;
  createdBy?: ActivityCreatedBy | null;
}

// ── Mutations ────────────────────────────────────────────

export interface ActivityCreateData {
  type: ActivityType;
  subject: string;
  description?: string;
  duration?: number;
  scheduledAt?: string;
  endTime?: string;
  locationName?: string;
  leadId?: string;
  contactId?: string;
}

export interface ActivityUpdateData {
  type?: ActivityType;
  subject?: string;
  description?: string;
  duration?: number;
  scheduledAt?: string;
  endTime?: string;
  locationName?: string;
}

export interface ActivityCompleteData {
  outcome?: string;
}

// ── Query params ─────────────────────────────────────────

export interface ActivityListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: ActivityType;
  leadId?: string;
  contactId?: string;
  createdById?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}
