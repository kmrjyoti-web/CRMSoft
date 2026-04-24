// ---------------------------------------------------------------------------
// Offline Sync Types
// ---------------------------------------------------------------------------

export interface SyncPolicy {
  id: string;
  entityName: string;
  isEnabled: boolean;
  syncDirection: "BIDIRECTIONAL" | "SERVER_TO_CLIENT" | "CLIENT_TO_SERVER";
  conflictResolution: "SERVER_WINS" | "CLIENT_WINS" | "MANUAL";
  maxRecords?: number;
  syncInterval?: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncWarningRule {
  id: string;
  ruleType: "STALE_DATA" | "LARGE_PAYLOAD" | "CONFLICT_RATE" | "DEVICE_OFFLINE";
  threshold: number;
  action: "WARN" | "BLOCK" | "NOTIFY_ADMIN";
  message?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SyncDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion?: string;
  userId: string;
  userName?: string;
  lastSyncAt?: string;
  lastHeartbeatAt?: string;
  status: "ONLINE" | "OFFLINE" | "BLOCKED";
  syncedRecordCount?: number;
  pendingPushCount?: number;
  createdAt: string;
}

export interface SyncConflict {
  id: string;
  entityName: string;
  entityId: string;
  deviceId: string;
  serverVersion: Record<string, unknown>;
  clientVersion: Record<string, unknown>;
  status: "PENDING" | "RESOLVED";
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: "SERVER_WINS" | "CLIENT_WINS" | "MERGED";
  createdAt: string;
}

export interface FlushCommand {
  id: string;
  targetDeviceId?: string;
  reason: string;
  status: "PENDING" | "ACKNOWLEDGED" | "EXPIRED";
  issuedBy: string;
  issuedAt: string;
  acknowledgedAt?: string;
}

export interface SyncDashboard {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  blockedDevices: number;
  pendingConflicts: number;
  totalSyncsToday: number;
  avgSyncDuration: number;
  entitySyncStatus: { entity: string; lastSyncAt: string; recordCount: number }[];
}

export interface SyncAuditEntry {
  id: string;
  action: string;
  entityName?: string;
  deviceId?: string;
  userId?: string;
  details?: string;
  createdAt: string;
}

export interface SyncAnalytics {
  syncFrequencyByDay: { date: string; count: number }[];
  conflictRateByEntity: { entity: string; rate: number }[];
  avgSyncDuration: number;
  peakSyncHour: number;
  totalDataTransferred: number;
}

export interface SyncConfig {
  policies: SyncPolicy[];
  globalSettings: Record<string, unknown>;
}

export interface SyncStatus {
  warnings: string[];
  enforcement: string[];
  flushCommands: FlushCommand[];
}

// DTOs
export interface UpdatePolicyDto {
  isEnabled?: boolean;
  syncDirection?: "BIDIRECTIONAL" | "SERVER_TO_CLIENT" | "CLIENT_TO_SERVER";
  conflictResolution?: "SERVER_WINS" | "CLIENT_WINS" | "MANUAL";
  maxRecords?: number;
  syncInterval?: number;
  priority?: number;
}

export interface CreateWarningRuleDto {
  ruleType: "STALE_DATA" | "LARGE_PAYLOAD" | "CONFLICT_RATE" | "DEVICE_OFFLINE";
  threshold: number;
  action: "WARN" | "BLOCK" | "NOTIFY_ADMIN";
  message?: string;
}

export interface IssueFlushDto {
  targetDeviceId?: string;
  reason: string;
}

export interface ResolveConflictDto {
  resolution: "SERVER_WINS" | "CLIENT_WINS" | "MERGED";
  mergedData?: Record<string, unknown>;
}

export interface RegisterDeviceDto {
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion?: string;
}

export interface SyncLogFilters {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}
