/**
 * Request DTO interfaces — match the backend DTO validation schemas.
 * Source of truth: API/src/modules/{module}/presentation/dto/
 */

import type {
  LeadStatus, LeadPriority, ContactType, ContactSource, OrgType,
  ActivityType, QuotationStatus, QuotationPriceType, TaskStatus,
  TaskPriority, TaskType, DemoStatus, DemoMode, TourPlanStatus,
} from '../enums';

// ── Common ───────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

// ── Lead DTOs ────────────────────────────────────────────────────────────────

export interface CreateLeadDto {
  name: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  expectedValue?: number;
  expectedCloseDate?: string;
  sourceId?: string;
  contactId?: string;
  organizationId?: string;
  allocatedToId?: string;
}

export type UpdateLeadDto = Partial<CreateLeadDto>;

export interface LeadQueryDto extends PaginationQuery {
  status?: LeadStatus;
  priority?: LeadPriority;
  allocatedToId?: string;
  contactId?: string;
  organizationId?: string;
}

// ── Contact DTOs ─────────────────────────────────────────────────────────────

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  type?: ContactType;
  source?: ContactSource;
  designationId?: string;
  departmentId?: string;
  organizationId?: string;
  assignedToId?: string;
}

export type UpdateContactDto = Partial<CreateContactDto>;

export interface ContactQueryDto extends PaginationQuery {
  type?: ContactType;
  source?: ContactSource;
  organizationId?: string;
  assignedToId?: string;
}

// ── Organization DTOs ─────────────────────────────────────────────────────────

export interface CreateOrganizationDto {
  name: string;
  type?: OrgType;
  email?: string;
  phone?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
  assignedToId?: string;
}

export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;

export interface OrganizationQueryDto extends PaginationQuery {
  type?: OrgType;
  industry?: string;
  city?: string;
  assignedToId?: string;
}

// ── Activity DTOs ────────────────────────────────────────────────────────────

export interface CreateActivityDto {
  type: ActivityType;
  subject: string;
  description?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  dueDate?: string;
  outcome?: string;
  assignedToId?: string;
}

export type UpdateActivityDto = Partial<CreateActivityDto>;

export interface ActivityQueryDto extends PaginationQuery {
  type?: ActivityType;
  leadId?: string;
  contactId?: string;
  assignedToId?: string;
  isCompleted?: boolean;
}

// ── Quotation DTOs ───────────────────────────────────────────────────────────

export interface QuotationLineItemDto {
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
}

export interface CreateQuotationDto {
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  priceType?: QuotationPriceType;
  currency?: string;
  validUntil?: string;
  paymentTerms?: string;
  notes?: string;
  lineItems?: QuotationLineItemDto[];
}

export type UpdateQuotationDto = Partial<CreateQuotationDto>;

export interface QuotationQueryDto extends PaginationQuery {
  status?: QuotationStatus;
  leadId?: string;
  contactId?: string;
}

// ── Task DTOs ────────────────────────────────────────────────────────────────

export interface CreateTaskDto {
  title: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  dueDate?: string;
  leadId?: string;
  contactId?: string;
  assignedToId?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface TaskQueryDto extends PaginationQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  leadId?: string;
}

// ── Demo DTOs ────────────────────────────────────────────────────────────────

export interface CreateDemoDto {
  leadId: string;
  contactId?: string;
  mode?: DemoMode;
  scheduledAt?: string;
  conductedById?: string;
  notes?: string;
}

export type UpdateDemoDto = Partial<CreateDemoDto>;

export interface DemoQueryDto extends PaginationQuery {
  status?: DemoStatus;
  mode?: DemoMode;
  leadId?: string;
  conductedById?: string;
}

// ── Tour Plan DTOs ───────────────────────────────────────────────────────────

export interface CreateTourPlanDto {
  userId: string;
  date: string;
  notes?: string;
}

export type UpdateTourPlanDto = Partial<CreateTourPlanDto>;

export interface TourPlanQueryDto extends PaginationQuery {
  status?: TourPlanStatus;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}
