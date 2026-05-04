export interface RechargePlan {
  id: string;
  name: string;
  amount: number;
  tokens: number;
  bonusTokens: number;
  isActive: boolean;
  sortOrder: number;
  description?: string;
  industryCode?: string | null;
}

export interface RechargePlanCreateData {
  name: string;
  amount: number;
  tokens: number;
  bonusTokens?: number;
  description?: string;
  sortOrder?: number;
  industryCode?: string;
}
