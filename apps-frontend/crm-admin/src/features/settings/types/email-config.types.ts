// ── Email Provider ───────────────────────────────────────
export type EmailProvider = 'GMAIL' | 'OUTLOOK' | 'IMAP_SMTP' | 'ORGANIZATION_SMTP';

// ── Email Account Status ────────────────────────────────
export type EmailAccountStatus =
  | 'ACTIVE'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'TOKEN_EXPIRED'
  | 'SYNCING';

// ── Email Account ───────────────────────────────────────
export interface EmailAccount {
  id: string;
  tenantId: string;
  userId: string;
  provider: EmailProvider;
  label?: string | null;
  emailAddress: string;
  displayName?: string | null;

  // Status & Sync
  status: EmailAccountStatus;
  lastSyncAt?: string | null;
  lastSyncError?: string | null;
  syncEnabled: boolean;

  // Defaults & Settings
  isDefault: boolean;
  autoLinkEnabled: boolean;
  signatureId?: string | null;

  // Stats
  totalSent: number;
  totalReceived: number;
  dailySendLimit: number;
  todaySentCount: number;

  createdAt: string;
  updatedAt: string;
}

// ── Connect Payload ─────────────────────────────────────
export interface ConnectEmailPayload {
  provider: EmailProvider;
  emailAddress: string;
  displayName?: string;
  label?: string;

  // OAuth
  accessToken?: string;
  refreshToken?: string;

  // IMAP/SMTP
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
}

// ── Test Connection Payload ─────────────────────────────
export interface TestConnectionPayload {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
}

export interface TestConnectionResult {
  smtp: boolean;
  imap: boolean;
}

// ── OAuth ───────────────────────────────────────────────
export interface OAuthInitiatePayload {
  provider: 'GMAIL' | 'OUTLOOK';
}

export interface OAuthInitiateResult {
  authUrl: string;
  redirectUrl: string;
}

export interface OAuthCallbackPayload {
  code: string;
  provider: 'GMAIL' | 'OUTLOOK';
  emailAddress?: string;
  displayName?: string;
  label?: string;
}

// ── List Params ─────────────────────────────────────────
export interface EmailAccountListParams {
  [key: string]: unknown;
}
