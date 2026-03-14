import type {
  CommunicationType,
  PriorityType,
  CommunicationInput,
  OrgRelationType,
} from "@/features/contacts/types/contacts.types";

// Re-export for convenience
export type { CommunicationInput };

// ── Enums ────────────────────────────────────────────────

export type RawContactStatus = "RAW" | "VERIFIED" | "REJECTED" | "DUPLICATE";

export type RawContactSource = "MANUAL" | "BULK_IMPORT" | "WEB_FORM" | "REFERRAL" | "API";

// ── Core Entity ──────────────────────────────────────────

export interface RawContactItem {
  id: string;
  firstName: string;
  lastName: string;
  status: RawContactStatus;
  source: RawContactSource;
  companyName?: string;
  designation?: string;
  department?: string;
  notes?: string;
  verifiedAt?: string;
  verifiedById?: string;
  contactId?: string;
  isActive?: boolean;
  entityVerificationStatus?: string;
  entityVerifiedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export interface RawContactCommunication {
  id: string;
  type: CommunicationType;
  value: string;
  priorityType: PriorityType;
  isPrimary: boolean;
  isVerified: boolean;
  label?: string;
}

export interface RawContactFilter {
  id: string;
  lookupValueId: string;
  lookupValue: {
    id: string;
    value: string;
    label: string;
  };
}

// ── List Item (GET /raw-contacts) ────────────────────────

export interface RawContactListItem extends RawContactItem {
  communications: RawContactCommunication[];
}

// ── Detail (GET /raw-contacts/:id) ──────────────────────

export interface RawContactDetail extends RawContactItem {
  communications: RawContactCommunication[];
  filters: RawContactFilter[];
  verifiedBy?: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  contact?: { id: string; firstName: string; lastName: string };
}

// ── Request DTOs ─────────────────────────────────────────

export interface RawContactCreateData {
  firstName: string;
  lastName: string;
  source?: RawContactSource;
  companyName?: string;
  designation?: string;
  department?: string;
  notes?: string;
  communications?: CommunicationInput[];
  filterIds?: string[];
}

export interface RawContactUpdateData {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  designation?: string;
  department?: string;
  notes?: string;
}

export interface VerifyRawContactData {
  organizationId?: string;
  contactOrgRelationType?: OrgRelationType;
}

export interface RejectRawContactData {
  reason?: string;
}

// ── Query Params ─────────────────────────────────────────

export interface RawContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: RawContactStatus;
  source?: RawContactSource;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  [key: string]: unknown;
}
