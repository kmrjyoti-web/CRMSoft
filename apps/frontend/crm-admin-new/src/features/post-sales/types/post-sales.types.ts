/* ------------------------------------------------------------------ */
/*  Post-Sales module types – Installations, Trainings, Tickets       */
/* ------------------------------------------------------------------ */

// ── Enums ────────────────────────────────────────────────────────────

export type InstallationStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TrainingStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TrainingMode = "ONSITE" | "REMOTE" | "HYBRID";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED" | "REOPENED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketCategory =
  | "INSTALLATION"
  | "PRODUCT"
  | "BILLING"
  | "GENERAL"
  | "FEATURE_REQUEST"
  | "BUG";

// ── Installation ─────────────────────────────────────────────────────

export interface InstallationAssignedTo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InstallationContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InstallationOrganization {
  id: string;
  name: string;
}

export interface InstallationItem {
  id: string;
  installationNo: string;
  status: InstallationStatus;
  title: string;
  description?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  quotationId?: string;
  invoiceId?: string;
  scheduledDate: string;
  startedDate?: string;
  completedDate?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assignedToId?: string;
  notes?: string;
  internalNotes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstallationListItem extends InstallationItem {
  assignedTo?: InstallationAssignedTo;
  contact?: InstallationContact;
  organization?: InstallationOrganization;
}

export interface InstallationDetail extends InstallationItem {
  assignedTo?: InstallationAssignedTo;
  contact?: InstallationContact;
  organization?: InstallationOrganization;
  lead?: { id: string; title: string };
}

export interface InstallationCreateData {
  title: string;
  description?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  quotationId?: string;
  invoiceId?: string;
  scheduledDate: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assignedToId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface InstallationUpdateData {
  title?: string;
  description?: string;
  scheduledDate?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assignedToId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface InstallationListParams {
  page?: number;
  limit?: number;
  status?: string;
  contactId?: string;
  organizationId?: string;
  assignedToId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}

// ── Training ─────────────────────────────────────────────────────────

export interface TrainingContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TrainingOrganization {
  id: string;
  name: string;
}

export interface TrainingItem {
  id: string;
  trainingNo: string;
  status: TrainingStatus;
  mode: TrainingMode;
  title: string;
  description?: string;
  topics?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  completedDate?: string;
  trainerName?: string;
  trainerContact?: string;
  location?: string;
  meetingLink?: string;
  maxAttendees?: number;
  actualAttendees?: number;
  feedback?: string;
  rating?: number;
  notes?: string;
  internalNotes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingListItem extends TrainingItem {
  contact?: TrainingContact;
  organization?: TrainingOrganization;
}

export interface TrainingDetail extends TrainingItem {
  contact?: TrainingContact;
  organization?: TrainingOrganization;
  lead?: { id: string; title: string };
}

export interface TrainingCreateData {
  title: string;
  description?: string;
  topics?: string;
  mode: TrainingMode;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  trainerName?: string;
  trainerContact?: string;
  location?: string;
  meetingLink?: string;
  maxAttendees?: number;
  notes?: string;
  internalNotes?: string;
}

export interface TrainingUpdateData {
  title?: string;
  description?: string;
  topics?: string;
  mode?: TrainingMode;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  trainerName?: string;
  trainerContact?: string;
  location?: string;
  meetingLink?: string;
  maxAttendees?: number;
  notes?: string;
  internalNotes?: string;
}

export interface TrainingListParams {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
  contactId?: string;
  organizationId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}

// ── Ticket ───────────────────────────────────────────────────────────

export interface TicketAssignedTo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TicketContact {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TicketOrganization {
  id: string;
  name: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  authorId: string;
  author?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface TicketItem {
  id: string;
  ticketNo: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subject: string;
  description?: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  assignedToId?: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolution?: string;
  closedAt?: string;
  closedById?: string;
  tags?: string;
  notes?: string;
  internalNotes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListItem extends TicketItem {
  assignedTo?: TicketAssignedTo;
  contact?: TicketContact;
  organization?: TicketOrganization;
}

export interface TicketDetail extends TicketItem {
  assignedTo?: TicketAssignedTo;
  contact?: TicketContact;
  organization?: TicketOrganization;
  comments?: TicketComment[];
}

export interface TicketCreateData {
  subject: string;
  description?: string;
  priority: TicketPriority;
  category: TicketCategory;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  assignedToId?: string;
  tags?: string;
  notes?: string;
  internalNotes?: string;
}

export interface TicketUpdateData {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  tags?: string;
  notes?: string;
  internalNotes?: string;
}

export interface AssignTicketData {
  assignedToId: string;
}

export interface ResolveTicketData {
  resolution: string;
}

export interface AddCommentData {
  content: string;
}

export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedToId?: string;
  contactId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: unknown;
}
