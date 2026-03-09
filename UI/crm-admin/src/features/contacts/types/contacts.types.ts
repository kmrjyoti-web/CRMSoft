// ── Enums ────────────────────────────────────────────────

export type CommunicationType = "PHONE" | "EMAIL" | "MOBILE" | "ADDRESS" | "WHATSAPP";

export type PriorityType = "PRIMARY" | "WORK" | "HOME" | "PERSONAL" | "OTHER";

export type OrgRelationType =
  | "PRIMARY_CONTACT"
  | "EMPLOYEE"
  | "CONSULTANT"
  | "PARTNER"
  | "VENDOR"
  | "DIRECTOR"
  | "FOUNDER";

// ── Core Entity ──────────────────────────────────────────

export interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  notes?: string;
  isActive: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export interface ContactCommunication {
  id: string;
  type: CommunicationType;
  value: string;
  priorityType: PriorityType;
  isPrimary: boolean;
  isVerified: boolean;
  label?: string;
}

export interface ContactOrganization {
  id: string;
  relationType: OrgRelationType;
  isPrimary: boolean;
  designation?: string;
  department?: string;
  organization: {
    id: string;
    name: string;
    industry?: string;
    city?: string;
    isActive: boolean;
  };
}

export interface ContactLead {
  id: string;
  leadNumber: string;
  status: string;
  priority: string;
  expectedValue: number;
  createdAt: string;
}

export interface ContactFilter {
  id: string;
  lookupValueId: string;
  lookupValue: {
    id: string;
    value: string;
    label: string;
    lookup?: { category: string };
  };
}

// ── List Item (GET /contacts) ────────────────────────────

export interface ContactListItem extends ContactItem {
  communications: ContactCommunication[];
  contactOrganizations: ContactOrganization[];
}

// ── Detail (GET /contacts/:id) ───────────────────────────

export interface ContactDetail extends ContactItem {
  communications: ContactCommunication[];
  contactOrganizations: ContactOrganization[];
  leads: ContactLead[];
  filters: ContactFilter[];
  counts: {
    leads: number;
    communications: number;
    activities: number;
  };
}

// ── Request DTOs ─────────────────────────────────────────

export interface CommunicationInput {
  type: CommunicationType;
  value: string;
  priorityType?: PriorityType;
  label?: string;
  isPrimary?: boolean;
}

export interface ContactCreateData {
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  notes?: string;
  communications?: CommunicationInput[];
  organizationId?: string;
  orgRelationType?: OrgRelationType;
  filterIds?: string[];
}

export interface ContactUpdateData {
  firstName?: string;
  lastName?: string;
  designation?: string;
  department?: string;
  notes?: string;
  communications?: CommunicationInput[];
  organizationId?: string;
  filterIds?: string[];
}

// ── Query Params ─────────────────────────────────────────

export interface ContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  designation?: string;
  department?: string;
  organizationId?: string;
  isActive?: boolean;
  [key: string]: unknown;
}
