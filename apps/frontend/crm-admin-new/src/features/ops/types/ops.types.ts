// ─── DB Maintenance ──────────────────────────────────────────────────────────

export interface IndexStat {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexSize: string;
  indexScans: number;
  isUnique: boolean;
  isUnused: boolean;
}

export interface TableStat {
  tableName: string;
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexSize: string;
  bloatPercent: number;
  lastVacuum: string | null;
  lastAnalyze: string | null;
  seqScans: number;
  indexScans: number;
}

export interface SlowQuery {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  stddevTime: number;
  rows: number;
}

export interface ConnectionPool {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  maxConnections: number;
  utilizationPercent: number;
}

export interface MaintenanceResult {
  operation: string;
  target: string;
  duration: number;
  success: boolean;
  message: string;
}

export interface CleanupResult {
  type: string;
  deleted: number;
  duration: number;
}

export interface DbSummary {
  databases: Array<{ name: string; size: string; connections: number }>;
  totalSize: string;
  pgVersion: string;
}

export interface IndexStatsResponse {
  unused: IndexStat[];
  duplicate: string[];
  total: number;
}

export interface BloatAnalysis {
  tables: Array<{
    tableName: string;
    deadTuples: number;
    liveTuples: number;
    bloatPercent: number;
    tableSize: string;
    lastVacuum: string | null;
    lastAutovacuum: string | null;
  }>;
  indexes: Array<{
    indexName: string;
    tableName: string;
    indexSize: string;
    indexScans: number;
  }>;
}

// ─── Backup/Restore ──────────────────────────────────────────────────────────

export type BackupSchema = 'identity' | 'platform' | 'working' | 'marketplace';
export type BackupStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
export type RestoreStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface BackupLog {
  id: string;
  schemaName: string;
  dbName: string;
  r2Key: string | null;
  r2Url: string | null;
  sizeBytes: string | null;
  checksum: string | null;
  status: BackupStatus;
  errorMessage: string | null;
  triggeredBy: string;
  durationMs: number | null;
  retentionDays: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface RestoreLog {
  id: string;
  backupLogId: string | null;
  schemaName: string;
  dbName: string;
  status: RestoreStatus;
  errorMessage: string | null;
  triggeredBy: string;
  durationMs: number | null;
  createdAt: string;
}

export interface BackupResult {
  logId: string;
  schemaName: string;
  dbName: string;
  r2Key: string | null;
  r2Url: string | null;
  sizeBytes: number;
  checksum: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  durationMs: number;
}

// ─── System Health ───────────────────────────────────────────────────────────

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  checks: Array<{
    name: string;
    status: 'ok' | 'error';
    message?: string;
    latency?: number;
  }>;
}

// ─── Cron Jobs ───────────────────────────────────────────────────────────────

export interface CronJobInfo {
  name: string;
  schedule: string;
  description: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'active' | 'disabled' | 'running';
}
