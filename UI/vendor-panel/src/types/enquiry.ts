export type EnquiryStatus = 'ENQ_NEW' | 'ENQ_RESPONDED' | 'ENQ_QUOTED' | 'ENQ_NEGOTIATING' | 'ENQ_CONVERTED' | 'ENQ_CLOSED' | 'ENQ_SPAM';

export interface Enquiry {
  id: string;
  tenantId: string;
  vendorId: string;
  buyerId: string;
  buyer?: { id: string; firstName: string; lastName: string; email: string; phone?: string; companyName?: string };
  listingId?: string;
  listing?: { id: string; title: string; mediaUrls: string[] };
  subject?: string;
  message: string;
  status: EnquiryStatus;
  quantity?: number;
  budget?: number;
  deliveryLocation?: string;
  requiredByDate?: string;
  thread: EnquiryMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  senderId: string;
  senderType: 'BUYER' | 'VENDOR';
  senderName: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface EnquiryFilters {
  status?: EnquiryStatus;
  search?: string;
  page?: number;
  limit?: number;
}
