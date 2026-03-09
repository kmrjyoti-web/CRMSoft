// ── Base ─────────────────────────────────────────────────

export interface OrganizationItem {
  id: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  industry?: string;
  annualRevenue?: number | null;
  numberOfEmployees?: number | null;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Relations ────────────────────────────────────────────

export type OrgRelationType =
  | "PRIMARY_CONTACT"
  | "EMPLOYEE"
  | "CONSULTANT"
  | "PARTNER"
  | "VENDOR"
  | "DIRECTOR"
  | "FOUNDER";

export interface OrganizationContact {
  id: string;
  relationType: OrgRelationType;
  designation?: string;
  isPrimary: boolean;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface OrganizationLead {
  id: string;
  leadNumber: string;
  status: string;
  priority: string;
  expectedValue?: number;
  createdAt?: string;
}

export interface OrganizationFilter {
  id: string;
  lookupValueId: string;
  lookupValue: {
    id: string;
    value: string;
    label: string;
    lookup?: { category: string };
  };
}

// ── List item (paginated) ────────────────────────────────

export interface OrganizationListItem extends OrganizationItem {
  contacts?: OrganizationContact[];
  leads?: OrganizationLead[];
  filters?: OrganizationFilter[];
}

// ── Detail (single fetch) ────────────────────────────────

export interface OrganizationDetail extends OrganizationItem {
  contacts?: OrganizationContact[];
  leads?: OrganizationLead[];
  filters?: OrganizationFilter[];
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    contacts: number;
    leads: number;
  };
}

// ── Mutations ────────────────────────────────────────────

export interface OrganizationCreateData {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  industry?: string;
  annualRevenue?: number | null;
  notes?: string;
  filterIds?: string[];
}

export interface OrganizationUpdateData {
  name?: string;
  website?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  industry?: string;
  annualRevenue?: number | null;
  notes?: string;
  filterIds?: string[];
}

// ── Query params ─────────────────────────────────────────

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  city?: string;
  industry?: string;
  isActive?: boolean;
  [key: string]: unknown;
}
