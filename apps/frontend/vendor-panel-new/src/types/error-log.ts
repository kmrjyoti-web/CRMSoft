export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type ErrorStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED';

export interface ErrorLog {
  id: string;
  errorCode: string;
  message: string;
  severity: ErrorSeverity;
  traceId: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  requestHeaders?: Record<string, string>;
  responseBody?: Record<string, unknown>;
  responseTimeMs?: number;
  userName?: string;
  userRole?: string;
  tenantName?: string;
  industryCode?: string;
  isAutoReported?: boolean;
  autoReportedAt?: string;
  autoReportedTo?: string[];
  reportedToProvider?: boolean;
  status?: ErrorStatus;
  resolvedAt?: string;
  resolution?: string;
  assignedToId?: string;
  assignedToName?: string;
  supportTicketId?: string;
}

export interface ErrorLogFilters {
  severity?: ErrorSeverity;
  status?: ErrorStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  module?: string;
  page?: number;
  limit?: number;
}

export type ErrorLayer = 'DB' | 'BE' | 'FE' | 'MOB';

export interface ErrorStats {
  total24h: number;
  bySeverity: Record<ErrorSeverity, number>;
  byLayer?: Partial<Record<ErrorLayer, number>>;
  errorRate: number;
  trend: number;
}

export interface ErrorTrend {
  date: string;
  count: number;
}

export interface ErrorAutoReportRule {
  id: string;
  tenantId?: string;
  name: string;
  severity: ErrorSeverity;
  channels: string[];
  emailRecipients: string[];
  slackWebhookUrl?: string;
  whatsappNumbers: string[];
  throttleMinutes: number;
  lastTriggeredAt?: string;
  isActive: boolean;
}
