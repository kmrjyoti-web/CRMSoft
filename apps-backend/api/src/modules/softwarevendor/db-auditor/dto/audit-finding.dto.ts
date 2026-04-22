export type AuditSeverity = 'error' | 'warn';
export type AuditCheckId = 'naming' | 'crossDbInclude' | 'fkOrphan';

export interface AuditFinding {
  severity: AuditSeverity;
  check: AuditCheckId;
  db: string;
  model?: string;
  table?: string;
  rule: string;
  message: string;
  file?: string;
  line?: number;
}

export interface AuditReport {
  runId: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  summary: {
    totalFindings: number;
    errors: number;
    warnings: number;
    byCheck: Record<AuditCheckId, number>;
    byDb: Record<string, number>;
  };
  findings: AuditFinding[];
}
