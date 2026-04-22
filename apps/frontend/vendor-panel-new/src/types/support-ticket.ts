export type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'BILLING' | 'PERFORMANCE' | 'DATA_ISSUE' | 'SECURITY' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'WAITING_ON_VENDOR' | 'RESOLVED' | 'CLOSED';

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
  satisfactionComment?: string;
  linkedErrorIds: string[];
  firstResponseAt?: string;
  slaBreached: boolean;
  reportedByName?: string;
  reportedByEmail?: string;
  tenantName?: string;
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

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
  avgResponseHours: number;
  avgSatisfaction: number;
  totalRatings: number;
}

export interface TicketFilters {
  tenantId?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}
