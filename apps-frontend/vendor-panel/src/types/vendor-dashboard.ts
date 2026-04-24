export interface VendorDashboardOverview {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrr: number;
  arr: number;
  newTenants: number;
  churnRate: number;
}

export interface MRRDataPoint {
  month: string;
  mrr: number;
}

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export interface PlanDistributionItem {
  planName: string;
  planCode: string;
  count: number;
  percentage: number;
}

export interface RevenueSummary {
  totalRecharged: number;
  totalSpent: number;
  activeWallets: number;
  totalWallets: number;
  periodDays: number;
}

export interface SpendByCategory {
  category: string;
  tokens: number;
}

export interface TopService {
  serviceKey: string;
  tokens: number;
  count: number;
}

export interface DailyTrend {
  date: string;
  tokens: number;
}
