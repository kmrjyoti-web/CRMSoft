export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "PERMANENT_DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT"
  | "BULK_UPDATE"
  | "BULK_DELETE";

export type AuditEntityType =
  | "contact"
  | "organization"
  | "lead"
  | "activity"
  | "user"
  | "role"
  | "raw_contact"
  | "quotation"
  | "invoice"
  | "payment"
  | "installation"
  | "training"
  | "ticket"
  | "workflow"
  | "template";

export interface AuditFieldChange {
  id: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  oldDisplayValue?: string | null;
  newDisplayValue?: string | null;
}

export interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  performedById?: string | null;
  performedByName?: string | null;
  performedByEmail?: string | null;
  performedByRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  httpMethod?: string | null;
  requestUrl?: string | null;
  source?: string | null;
  module?: string | null;
  correlationId?: string | null;
  tags?: string[];
  isSensitive?: boolean;
  fieldChanges?: AuditFieldChange[];
  createdAt: string;
}

export interface AuditDiff {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: AuditFieldChange[];
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditSearchParams extends AuditQueryParams {
  q?: string;
  field?: string;
  module?: string;
  sensitive?: boolean;
}

export interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: { userId: string; name: string; count: number }[];
}
