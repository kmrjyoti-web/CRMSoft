export type AuditSessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type AuditActionType =
  | 'PAGE_VISIT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'SETTINGS_CHANGE'
  | 'PERMISSION_DENIED'
  | 'API_CALL'
  | 'FILE_UPLOAD'
  | 'FILE_DOWNLOAD'
  | 'SEARCH'
  | 'BULK_ACTION';

export interface TenantAuditSession {
  id: string;
  tenantId: string;
  startedById: string;
  startedByName?: string;
  reason: string;
  startedAt: string;
  endedAt?: string;
  scheduledEndAt?: string;
  status: AuditSessionStatus;
  totalActions: number;
  uniqueUsers: number;
}

export interface TenantAuditLog {
  id: string;
  sessionId: string;
  tenantId: string;
  userId: string;
  userName?: string;
  userRole?: string;
  actionType: AuditActionType;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  pageUrl?: string;
  durationMs?: number;
  ipAddress?: string;
  deviceType?: string;
  createdAt: string;
}

export interface AuditReport {
  session: TenantAuditSession;
  summary: {
    totalActions: number;
    uniqueUsers: number;
    byAction: { action: string; count: number }[];
    byUser: { userId: string; userName?: string; count: number }[];
    byEntity: { entityType: string; count: number }[];
  };
}

export interface AuditLogFilters {
  userId?: string;
  actionType?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}
