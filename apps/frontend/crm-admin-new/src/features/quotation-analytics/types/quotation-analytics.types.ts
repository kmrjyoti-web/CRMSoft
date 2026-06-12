export interface QuotationOverview {
  totalQuotations: number;
  totalValue: number;
  avgValue: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  conversionRate: number;
  avgDaysToClose: number;
  vsLastPeriod: { quotations: number; value: number; conversionRate: number };
}

export interface ConversionFunnel {
  stages: {
    stage: string;
    count: number;
    value: number;
    conversionRate: number;
    avgDays: number;
  }[];
}

export interface QuotationTrend {
  period: string;
  created: number;
  sent: number;
  accepted: number;
  rejected: number;
  totalValue: number;
  acceptedValue: number;
}

export interface IndustryAnalytics {
  industry: string;
  count: number;
  value: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  productSku: string;
  timesQuoted: number;
  totalQuantity: number;
  totalValue: number;
  winRate: number;
}

export interface BestQuotation {
  id: string;
  quotationNumber: string;
  contactName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface QuotationComparison {
  quotations: {
    id: string;
    quotationNumber: string;
    totalAmount: number;
    discount: number;
    itemCount: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  status?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}
