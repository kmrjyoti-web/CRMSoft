export interface ServiceRate {
  id: string;
  serviceKey: string;
  displayName: string;
  category: string;
  baseTokens: number;
  marginPct: number;
  finalTokens: number;
  description?: string;
  isActive: boolean;
  industryCode?: string | null;
}

export interface ServiceRateCreateData {
  serviceKey: string;
  displayName: string;
  category: string;
  baseTokens: number;
  marginPct?: number;
  description?: string;
  industryCode?: string;
}
