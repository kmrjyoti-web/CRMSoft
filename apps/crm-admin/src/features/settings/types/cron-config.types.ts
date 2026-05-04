// ── Cron Job Status ─────────────────────────────────────
export type CronJobStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED';

// ── Cron Run Status ─────────────────────────────────────
export type CronRunStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'SKIPPED' | 'RUNNING';

// ── Cron Job Scope ──────────────────────────────────────
export type CronJobScope = 'GLOBAL' | 'TENANT';

// ── Cron Alert Channel ──────────────────────────────────
export type CronAlertChannel = 'EMAIL' | 'IN_APP' | 'BOTH';

// ── Cron Job ────────────────────────────────────────────
export interface CronJob {
  id: string;
  jobCode: string;
  jobName: string;
  description?: string | null;
  moduleName: string;

  // Schedule
  cronExpression: string;
  cronDescription?: string | null;
  timezone: string;

  // Scope & Status
  scope: CronJobScope;
  status: CronJobStatus;

  // Execution Control
  timeoutSeconds: number;
  maxRetries: number;
  retryDelaySeconds: number;
  allowConcurrent: boolean;

  // Last Run
  isRunning: boolean;
  lastRunAt?: string | null;
  lastRunStatus?: CronRunStatus | null;
  lastRunDurationMs?: number | null;
  lastRunError?: string | null;
  lastRunRecords?: number | null;
  nextRunAt?: string | null;

  // Stats
  totalRunCount: number;
  totalFailCount: number;
  avgDurationMs?: number | null;
  successRate?: number | null;

  // Alerting
  alertOnFailure: boolean;
  alertOnTimeout: boolean;
  alertAfterConsecutiveFailures: number;
  consecutiveFailures: number;
  alertChannel: CronAlertChannel;
  alertRecipientEmails: string[];
  alertRecipientUserIds: string[];

  // Job-Specific
  jobParams?: unknown;

  // Audit
  updatedById?: string | null;
  updatedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Cron Job Update ─────────────────────────────────────
export interface CronJobUpdate {
  cronExpression?: string;
  cronDescription?: string;
  timezone?: string;
  timeoutSeconds?: number;
  maxRetries?: number;
  retryDelaySeconds?: number;
  allowConcurrent?: boolean;
  alertOnFailure?: boolean;
  alertOnTimeout?: boolean;
  alertAfterConsecutiveFailures?: number;
  alertChannel?: CronAlertChannel;
  alertRecipientEmails?: string[];
  alertRecipientUserIds?: string[];
}

// ── Toggle Payload ──────────────────────────────────────
export interface CronJobTogglePayload {
  status: CronJobStatus;
}

// ── Job Params Update ───────────────────────────────────
export interface CronJobParamsUpdate {
  jobParams?: Record<string, unknown>;
}

// ── Run History ─────────────────────────────────────────
export interface CronRunHistory {
  id: string;
  jobId: string;
  jobCode: string;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
  status: CronRunStatus;
  recordsProcessed?: number | null;
  recordsSucceeded?: number | null;
  recordsFailed?: number | null;
  tenantId?: string | null;
  tenantName?: string | null;
  errorMessage?: string | null;
  retryAttempt: number;
  details?: unknown;
  triggeredBy: string;
  createdAt: string;
}

// ── Dashboard ───────────────────────────────────────────
export interface CronDashboard {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  failedLast24h: number;
  avgDurationMs: number;
  successRate: number;
}

// ── Query Params ────────────────────────────────────────
export interface CronJobListParams {
  status?: string;
  moduleName?: string;
  search?: string;
  [key: string]: unknown;
}

export interface CronRunHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
  triggeredBy?: string;
  [key: string]: unknown;
}
