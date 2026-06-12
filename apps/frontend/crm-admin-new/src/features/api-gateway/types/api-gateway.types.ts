// ---------------------------------------------------------------------------
// API Gateway Types
// ---------------------------------------------------------------------------

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: "ACTIVE" | "REVOKED";
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  secret: string;
}

export interface ApiScope {
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface Webhook {
  id: string;
  url: string;
  description?: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  failureCount?: number;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "SUCCESS" | "FAILURE";
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  status: "SUCCESS" | "FAILURE" | "PENDING";
  statusCode?: number;
  requestBody?: string;
  responseBody?: string;
  duration?: number;
  attempts: number;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  apiKeyId?: string;
  apiKeyName?: string;
  ipAddress: string;
  userAgent?: string;
  requestSize?: number;
  responseSize?: number;
  createdAt: string;
}

export interface ApiUsageSummary {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  topEndpoints: { path: string; count: number }[];
  topApiKeys: { name: string; count: number }[];
  requestsByDay: { date: string; count: number }[];
}

export interface WebhookStats {
  totalDeliveries: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  deliveriesByDay: { date: string; success: number; failure: number }[];
}

// DTOs
export interface CreateApiKeyDto {
  name: string;
  scopes: string[];
  expiresAt?: string;
}

export interface UpdateScopesDto {
  scopes: string[];
}

export interface CreateWebhookDto {
  url: string;
  description?: string;
  events: string[];
}

export interface UpdateWebhookDto {
  url?: string;
  description?: string;
  events?: string[];
  isActive?: boolean;
}

export interface ApiLogFilters {
  method?: string;
  path?: string;
  statusCode?: number;
  apiKeyId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface UsageFilters {
  fromDate?: string;
  toDate?: string;
}
