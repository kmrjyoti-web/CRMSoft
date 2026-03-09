export type MktOrderStatus = 'MKT_PENDING' | 'MKT_CONFIRMED' | 'MKT_PROCESSING' | 'MKT_SHIPPED' | 'MKT_DELIVERED' | 'MKT_CANCELLED' | 'MKT_RETURNED' | 'MKT_REFUNDED';
export type MktPaymentStatus = 'MPAY_PENDING' | 'MPAY_PAID' | 'MPAY_FAILED' | 'MPAY_REFUNDED' | 'MPAY_PARTIALLY_REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  tenantId: string;
  vendorId: string;
  buyerId: string;
  buyer?: OrderBuyer;
  status: MktOrderStatus;
  paymentStatus: MktPaymentStatus;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  discountAmount: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  note?: string;
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  listingId: string;
  listing?: { id: string; title: string; mediaUrls: string[] };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gstRate: number;
  gstAmount: number;
}

export interface OrderBuyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  gstNumber?: string;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderFilters {
  status?: MktOrderStatus;
  paymentStatus?: MktPaymentStatus;
  search?: string;
  page?: number;
  limit?: number;
}
