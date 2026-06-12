export interface Receipt {
  id: string;
  tenantId: string;
  receiptNumber: string;
  paymentId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  contactId?: string;
  contactName?: string;
  organizationId?: string;
  organizationName?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  receiptDate: string;
  notes?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFilters {
  page?: number;
  limit?: number;
  search?: string;
}
