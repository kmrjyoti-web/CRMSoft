export interface WaAnalyticsData {
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
}

export interface WaAgentPerformance {
  userId: string;
  userName: string;
  conversationsHandled: number;
  resolvedCount: number;
  pendingCount: number;
  avgResponseTimeMs?: number | null;
  resolutionRate: number;
  messagesSent: number;
}

export interface WaAnalyticsParams {
  wabaId?: string;
  dateFrom?: string;
  dateTo?: string;
}
