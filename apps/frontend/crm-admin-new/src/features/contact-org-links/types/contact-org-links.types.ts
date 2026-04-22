export interface ContactOrgMapping {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  organizationId: string;
  organizationName: string;
  designation?: string;
  department?: string;
  relationType: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkContactOrgDto {
  contactId: string;
  organizationId: string;
  designation?: string;
  department?: string;
  relationType?: string;
}

export interface UpdateContactOrgDto {
  designation?: string;
  department?: string;
}

export interface ChangeRelationDto {
  relationType: string;
}
