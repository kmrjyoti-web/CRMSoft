// ---------------------------------------------------------------------------
// Plugin Store Types
// ---------------------------------------------------------------------------

export type PluginCategory =
  | "COMMUNICATION" | "PAYMENT" | "CALENDAR" | "TELEPHONY"
  | "STORAGE" | "AI" | "MARKETING" | "ANALYTICS";

export type PluginStatus = "PLUGIN_ACTIVE" | "PLUGIN_INACTIVE" | "PLUGIN_DEPRECATED" | "PLUGIN_BETA";
export type TenantPluginStatus = "TP_ACTIVE" | "TP_INACTIVE" | "TP_ERROR" | "TP_PENDING_SETUP";

export interface PluginConfigField {
  name: string;
  label: string;
  type: "string" | "secret" | "number" | "email" | "select" | "boolean" | "url";
  required: boolean;
  options?: string[];
  default?: string | number | boolean;
  placeholder?: string;
}

export interface PluginCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: string;
  icon?: string;
  author?: string;
  isInstalled?: boolean;
  isPremium?: boolean;
  monthlyPrice?: number;
  requiresCredentials: boolean;
  configSchema?: { fields: PluginConfigField[] };
  credentialFields?: PluginCredentialField[];
  settingFields?: PluginSettingField[];
  hookPoints?: string[];
  hooks?: string[];
  menuCodes?: string[];
  webhookConfig?: { inbound: string; verificationMethod: string };
  oauthConfig?: { authUrl: string; tokenUrl: string; scopes: string[] };
  iconUrl?: string;
  setupGuideUrl?: string;
  sortOrder?: number;
  createdAt: string;
}

export interface PluginCredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  required: boolean;
  placeholder?: string;
}

export interface PluginSettingField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
}

export interface InstalledPlugin {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  version: string;
  status: "ACTIVE" | "DISABLED" | "ERROR" | "PENDING_SETUP" | TenantPluginStatus;
  isEnabled: boolean;
  credentials?: Record<string, string>;
  hasCredentials?: boolean;
  settings?: Record<string, unknown>;
  webhookUrl?: string;
  lastUsedAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  errorCount: number;
  consecutiveErrors: number;
  monthlyUsage: number;
  monthlyLimit?: number;
  installedAt: string;
  plugin?: PluginCatalogItem;
}

export interface PluginLog {
  id: string;
  pluginCode: string;
  hookName: string;
  hookPoint?: string;
  entityType?: string;
  entityId?: string;
  status: "SUCCESS" | "FAILURE" | "FAILED";
  duration: number;
  durationMs?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  error?: string;
  errorMessage?: string;
  createdAt: string;
  executedAt?: string;
}

export interface HealthCheckResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

export interface PluginUsageStats {
  pluginCode: string;
  pluginName: string;
  category: string;
  monthlyUsage: number;
  monthlyLimit: number | null;
  usagePercent: number | null;
  lastUsedAt: string | null;
  isEnabled: boolean;
}

export interface PluginHealthSummary {
  pluginCode: string;
  pluginName: string;
  status: string;
  isEnabled: boolean;
  lastUsedAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  errorCount: number;
  consecutiveErrors: number;
  hasHandler: boolean;
}

// DTOs
export interface InstallPluginDto {
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface UpdateCredentialsDto {
  credentials: Record<string, string>;
}

export interface UpdateSettingsDto {
  settings: Record<string, unknown>;
}

export interface PluginFilters {
  category?: string;
  search?: string;
}

// ── Category display config ─────────────────────────────────

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  COMMUNICATION: { label: "Communication", icon: "message-square", color: "#3b82f6" },
  PAYMENT: { label: "Payment", icon: "credit-card", color: "#16a34a" },
  CALENDAR: { label: "Calendar", icon: "calendar", color: "#06b6d4" },
  TELEPHONY: { label: "Telephony", icon: "phone", color: "#6366f1" },
  STORAGE: { label: "Storage", icon: "hard-drive", color: "#6b7280" },
  AI: { label: "AI & ML", icon: "cpu", color: "#ec4899" },
  MARKETING: { label: "Marketing", icon: "mail", color: "#ef4444" },
  ANALYTICS: { label: "Analytics", icon: "bar-chart", color: "#8b5cf6" },
};

// ── Status badge config ──────────────────────────────────────

export const STATUS_BADGE: Record<string, { label: string; variant: string; icon: string }> = {
  ACTIVE: { label: "Active", variant: "success", icon: "check-circle" },
  TP_ACTIVE: { label: "Active", variant: "success", icon: "check-circle" },
  DISABLED: { label: "Disabled", variant: "secondary", icon: "pause-circle" },
  TP_INACTIVE: { label: "Inactive", variant: "secondary", icon: "pause-circle" },
  ERROR: { label: "Error", variant: "danger", icon: "alert-circle" },
  TP_ERROR: { label: "Error", variant: "danger", icon: "alert-circle" },
  PENDING_SETUP: { label: "Setup Required", variant: "warning", icon: "settings" },
  TP_PENDING_SETUP: { label: "Setup Required", variant: "warning", icon: "settings" },
};
