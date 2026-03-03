// ── Tab IDs ──────────────────────────────────────────────

export type DevTabId =
  | "api-health"
  | "error-log"
  | "ui-kit"
  | "store-inspector"
  | "permissions"
  | "network-log"
  | "system-info"
  | "feature-flags"
  | "query-inspector";

export interface DevTab {
  id: DevTabId;
  label: string;
  icon: string;
  description: string;
}

// ── API Health ───────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "down" | "checking";

export interface EndpointHealth {
  name: string;
  url: string;
  method: "GET" | "POST";
  group: string;
  status: HealthStatus;
  statusCode?: number;
  responseTimeMs?: number;
  lastChecked?: string;
  error?: string;
}

export interface ApiHealthSummary {
  totalEndpoints: number;
  healthy: number;
  degraded: number;
  down: number;
  avgResponseTime: number;
}

// ── Error Log ────────────────────────────────────────────

export type ErrorSeverity = "error" | "warning" | "info";

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  component?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// ── Network Log ──────────────────────────────────────────

export type RequestStatus = "pending" | "success" | "error";

export interface NetworkLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: RequestStatus;
  statusCode?: number;
  duration?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
}

// ── Store Snapshot ───────────────────────────────────────

export interface StoreSnapshot {
  name: string;
  state: Record<string, unknown>;
  size: string;
  lastUpdated: string;
}

// ── System Info ──────────────────────────────────────────

export interface SystemInfo {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  runtime: {
    nextVersion: string;
    reactVersion: string;
    nodeEnv: string;
    apiBaseUrl: string;
  };
  browser: {
    userAgent: string;
    language: string;
    platform: string;
    screenSize: string;
    windowSize: string;
    online: boolean;
    cookiesEnabled: boolean;
  };
  auth: {
    userId: string;
    tenantId: string;
    roles: string[];
    permissionCount: number;
  };
}

// ── Feature Flags ────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  source: "tenant" | "env" | "hardcoded";
}

// ── Query Cache ──────────────────────────────────────────

export interface QueryCacheEntry {
  queryKey: string;
  state: "fresh" | "stale" | "fetching" | "paused" | "inactive";
  dataUpdatedAt: string;
  fetchCount: number;
  observerCount: number;
  isStale: boolean;
  dataSize: string;
}
