export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface TenantErrorLog {
  id: string;
  requestId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  severity: ErrorSeverity;
  path: string;
  method: string;
  module?: string;
  createdAt: string;
}
