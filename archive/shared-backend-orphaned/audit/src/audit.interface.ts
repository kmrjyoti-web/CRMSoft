export interface AuditLogParams {
  tenantId?: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  performedById?: string;
  performedByName?: string;
  performedByEmail?: string;
  performedByRole?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  requestUrl?: string;
  requestBody?: Record<string, unknown>;
  source?: string;
  module?: string;
  correlationId?: string;
  summary?: string;
  tags?: string[];
}

export interface IAuditService {
  log(params: AuditLogParams): Promise<any>;
}
