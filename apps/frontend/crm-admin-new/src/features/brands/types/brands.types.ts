// ── Entities ─────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  code: string;
  description?: string;
  website?: string;
  isActive: boolean;
  organizations?: BrandOrganization[];
  contacts?: BrandContact[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandOrganization {
  id: string;
  brandId: string;
  organizationId: string;
  organization?: { id: string; name: string };
  isPrimary: boolean;
  notes?: string;
}

export interface BrandContact {
  id: string;
  brandId: string;
  contactId: string;
  contact?: { id: string; firstName: string; lastName: string };
  isPrimary: boolean;
  notes?: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateBrandDto {
  name: string;
  code: string;
  description?: string;
  website?: string;
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

export interface BrandFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
