export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secretKey: string;
  lastDeliveryAt?: string;
  failureCount: number;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number;
  responseBody?: string;
  success: boolean;
  createdAt: string;
}

export interface WebhookFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
