// ── Entities ─────────────────────────────────────────────

export interface Manufacturer {
  id: string;
  name: string;
  code: string;
  description?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  organizations?: ManufacturerOrganization[];
  contacts?: ManufacturerContact[];
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturerOrganization {
  id: string;
  manufacturerId: string;
  organizationId: string;
  organization?: { id: string; name: string };
  isPrimary: boolean;
  notes?: string;
}

export interface ManufacturerContact {
  id: string;
  manufacturerId: string;
  contactId: string;
  contact?: { id: string; firstName: string; lastName: string };
  isPrimary: boolean;
  notes?: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateManufacturerDto {
  name: string;
  code: string;
  description?: string;
  website?: string;
  country?: string;
  isActive?: boolean;
}

export interface LinkOrganizationDto {
  organizationId: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface LinkContactDto {
  contactId: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface ManufacturerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
