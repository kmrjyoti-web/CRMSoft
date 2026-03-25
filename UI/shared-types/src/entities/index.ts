/**
 * Core entity interfaces — represent what the API actually returns.
 * Source of truth: API/prisma/schemas/*.prisma + backend DTO select clauses.
 * Dates are serialized as ISO strings in JSON responses.
 */

import type {
  LeadStatus, LeadPriority, ActivityType, TaskStatus, TaskPriority,
  TaskType, TaskRecurrence,
  QuotationStatus, QuotationPriceType, NegotiationType,
  InvoiceStatus, PaymentStatus, PaymentMethod,
  ContactType, ContactSource, OrgType, ProductStatus, PriceType,
  UserStatus, UserType, DemoStatus, DemoResult, DemoMode,
  RawContactStatus, RawContactSource, TicketStatus, TicketCategory,
  TicketPriority, TourPlanStatus,
} from '../enums';

// ── Common reference types ───────────────────────────────────────────────────

export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

export interface ContactRef {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

export interface OrganizationRef {
  id: string;
  name: string;
  type?: OrgType | null;
  city?: string | null;
  state?: string | null;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  userType: UserType;
  roleId: string;
  roleName?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  designationId?: string | null;
  designationName?: string | null;
  reportingToId?: string | null;
  employeeCode?: string | null;
  joiningDate?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Lead ─────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  tenantId: string;
  leadNumber: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  score?: number | null;
  expectedValue?: number | null;
  expectedCloseDate?: string | null;
  sourceId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  allocatedToId?: string | null;
  allocatedTo?: UserRef | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  contact?: ContactRef | null;
  organization?: OrganizationRef | null;
}

// ── Contact ──────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  tenantId: string;
  contactNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  type: ContactType;
  source: ContactSource;
  designationId?: string | null;
  designationName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  organizationId?: string | null;
  organization?: OrganizationRef | null;
  assignedToId?: string | null;
  assignedTo?: UserRef | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

// ── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  tenantId: string;
  orgNumber: string;
  name: string;
  type: OrgType;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  industry?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  assignedToId?: string | null;
  assignedTo?: UserRef | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  tenantId: string;
  productCode: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  hsnCode?: string | null;
  status: ProductStatus;
  priceType: PriceType;
  basePrice?: number | null;
  taxPercent?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Quotation ────────────────────────────────────────────────────────────────

export interface QuotationLineItem {
  id: string;
  quotationId: string;
  productId?: string | null;
  productName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent?: number | null;
  discountAmount?: number | null;
  taxPercent?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  sortOrder: number;
}

export interface Quotation {
  id: string;
  tenantId: string;
  quotationNumber: string;
  leadId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  status: QuotationStatus;
  priceType: QuotationPriceType;
  negotiationType?: NegotiationType | null;
  subtotal: number;
  discountValue?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  currency: string;
  validUntil?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  lineItems?: QuotationLineItem[];
  createdById: string;
  createdBy?: UserRef | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Activity ─────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  tenantId: string;
  type: ActivityType;
  subject: string;
  description?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  outcome?: string | null;
  isCompleted: boolean;
  createdById: string;
  createdByUser?: UserRef | null;
  assignedToId?: string | null;
  assignedTo?: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

// ── Raw Contact ──────────────────────────────────────────────────────────────

export interface RawContact {
  id: string;
  tenantId: string;
  rawNumber: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source: RawContactSource;
  status: RawContactStatus;
  isDuplicate: boolean;
  duplicateOfId?: string | null;
  assignedToId?: string | null;
  convertedContactId?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Invoice ──────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  leadId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  quotationId?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  discountAmount?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  paidAmount?: number | null;
  dueAmount?: number | null;
  currency: string;
  dueDate?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  tenantId: string;
  paymentNumber: string;
  invoiceId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  tenantId: string;
  taskNumber: string;
  title: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  dueDate?: string | null;
  completedAt?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  assignedToId?: string | null;
  assignedTo?: UserRef | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Demo ─────────────────────────────────────────────────────────────────────

export interface Demo {
  id: string;
  tenantId: string;
  demoNumber: string;
  leadId: string;
  contactId?: string | null;
  mode: DemoMode;
  status: DemoStatus;
  result?: DemoResult | null;
  scheduledAt?: string | null;
  conductedAt?: string | null;
  durationMinutes?: number | null;
  conductedById?: string | null;
  conductedBy?: UserRef | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Tour Plan ────────────────────────────────────────────────────────────────

export interface TourPlan {
  id: string;
  tenantId: string;
  tourNumber: string;
  userId: string;
  user?: UserRef | null;
  date: string;
  status: TourPlanStatus;
  totalVisits: number;
  completedVisits: number;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ── Support Ticket ───────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  subject: string;
  description?: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  contactId?: string | null;
  leadId?: string | null;
  assignedToId?: string | null;
  assignedTo?: UserRef | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export * from './customer-portal.types';
