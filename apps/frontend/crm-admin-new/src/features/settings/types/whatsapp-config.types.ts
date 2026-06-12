// ── WABA Connection Status ───────────────────────────────
export type WabaConnectionStatus =
  | 'ACTIVE'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'PENDING_VERIFICATION';

// ── WABA Config ─────────────────────────────────────────
export interface WABAConfig {
  id: string;
  tenantId: string;
  wabaId: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayName: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;

  // Business Profile
  businessProfilePhoto?: string | null;
  aboutText?: string | null;
  address?: string | null;
  verticalIndustry?: string | null;
  websiteUrl?: string | null;

  // Settings
  autoReplyEnabled: boolean;
  autoReplyMessage?: string | null;
  businessHoursEnabled: boolean;
  businessHoursConfig?: unknown;
  welcomeMessageEnabled: boolean;
  welcomeMessage?: string | null;

  // Stats
  totalConversations: number;
  totalMessagesSent: number;
  totalMessagesReceived: number;

  // Connection
  connectionStatus: WabaConnectionStatus;
  lastConnectedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ── Setup Payload ───────────────────────────────────────
export interface WABASetupPayload {
  wabaId: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayName: string;
  accessToken: string;
  webhookVerifyToken: string;
}

// ── Update Payload ──────────────────────────────────────
export interface WABAUpdatePayload {
  displayName?: string;
  accessToken?: string;
  settings?: {
    autoReplyEnabled?: boolean;
    autoReplyMessage?: string;
    businessHoursEnabled?: boolean;
    businessHoursConfig?: unknown;
    welcomeMessageEnabled?: boolean;
    welcomeMessage?: string;
  };
}
