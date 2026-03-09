// ---------------------------------------------------------------------------
// Plugin Store Types
// ---------------------------------------------------------------------------

export interface PluginCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  version: string;
  author?: string;
  isInstalled?: boolean;
  requiresCredentials: boolean;
  credentialFields?: PluginCredentialField[];
  settingFields?: PluginSettingField[];
  hooks?: string[];
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
  status: "ACTIVE" | "DISABLED" | "ERROR";
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
  installedAt: string;
  lastUsedAt?: string;
}

export interface PluginLog {
  id: string;
  pluginCode: string;
  hookName: string;
  status: "SUCCESS" | "FAILURE";
  duration: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: string;
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
