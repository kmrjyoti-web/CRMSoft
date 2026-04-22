export type TicketCategory =
  | 'BUG'
  | 'FEATURE_REQUEST'
  | 'BILLING'
  | 'PERFORMANCE'
  | 'DATA_ISSUE'
  | 'SECURITY'
  | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_CUSTOMER'
  | 'WAITING_ON_VENDOR'
  | 'RESOLVED'
  | 'CLOSED';

export interface SupportTicket {
  id: string;
  tenantId: string;
  reportedById: string;
  ticketNo: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  screenshots: string[];
  autoContext?: Record<string, unknown>;
  assignedToId?: string;
  assignedToName?: string;
  status: TicketStatus;
  resolvedAt?: string;
  resolution?: string;
  closedAt?: string;
  satisfactionRating?: number;
  linkedErrorIds: string[];
  slaBreached: boolean;
  reportedByName?: string;
  reportedByEmail?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  _count?: { messages: number };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName?: string;
  senderType: 'CUSTOMER' | 'VENDOR';
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: string;
  priority: string;
  screenshots?: string[];
  linkedErrorIds?: string[];
}
