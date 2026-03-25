export interface PortalUser {
  id: string;
  email: string;
  displayName: string;
  linkedEntityType: 'CONTACT' | 'ORGANIZATION' | 'LEDGER';
  linkedEntityId: string;
  menuCategoryId: string | null;
  pageOverrides: Record<string, boolean>;
  isFirstLogin: boolean;
  isActive: boolean;
  loginCount: number;
}

export interface PortalRoute {
  key: string;
  label: string;
  icon: string;
  path: string;
}

export interface LoginResponse {
  accessToken: string;
  user: PortalUser;
  availableRoutes: string[];
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  description?: string;
}

export interface PortalPayment {
  id: string;
  paymentNumber: string;
  date: string;
  amount: number;
  mode: string;
  reference: string;
  status: string;
  invoiceId?: string;
}

export interface PortalOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  items: Array<{ name: string; qty: number; rate: number }>;
}

export interface PortalSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface PortalDashboard {
  totalInvoices: number;
  pendingAmount: number;
  totalPayments: number;
  openTickets: number;
  recentInvoices: PortalInvoice[];
  recentPayments: PortalPayment[];
}
