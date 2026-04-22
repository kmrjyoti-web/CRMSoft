export interface AiTokenUsage {
  totalAllocated: number;
  totalConsumed: number;
  remainingTokens: number;
  costPerToken: number;
  sellPricePerToken: number;
  margin: number;
}

export interface TenantAiUsage {
  tenantId: string;
  tenantName: string;
  tokensUsed: number;
  tokensLimit: number;
  lastUsedAt: string;
}

export interface AiSettings {
  costPerToken: number;
  sellPricePerToken: number;
  defaultTokenLimit: number;
  rateLimitPerMinute: number;
}

export interface AiTokenFilters {
  search?: string;
  page?: number;
  limit?: number;
}
