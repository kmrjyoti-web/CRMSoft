// ── Credential Provider ──────────────────────────────────
export type CredentialProvider =
  | 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'SENDGRID' | 'MAILGUN'
  | 'WHATSAPP_BUSINESS'
  | 'RAZORPAY' | 'STRIPE'
  | 'AWS_S3' | 'MINIO' | 'GOOGLE_DRIVE' | 'ONEDRIVE' | 'DROPBOX'
  | 'GOOGLE_MAPS'
  | 'EXOTEL' | 'KNOWLARITY' | 'TWILIO'
  | 'FIREBASE' | 'CUSTOM'
  // AI Providers
  | 'ANTHROPIC_CLAUDE' | 'OPENAI_GPT' | 'GOOGLE_GEMINI' | 'GROQ';

export type CredentialStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ERROR' | 'PENDING_SETUP' | 'REVOKED';

// ── Credential Item ──────────────────────────────────────
export interface CredentialItem {
  id: string;
  tenantId: string;
  provider: CredentialProvider;
  instanceName?: string | null;
  status: CredentialStatus;
  statusMessage?: string | null;
  description?: string | null;
  linkedAccountEmail?: string | null;
  isPrimary: boolean;
  lastVerifiedAt?: string | null;
  lastUsedAt?: string | null;
  usageCount: number;
  dailyUsageCount: number;
  dailyUsageLimit?: number | null;
  createdAt: string;
  updatedAt: string;
  /** Masked credential data */
  maskedData?: Record<string, string>;
}

// ── Credential Schema ────────────────────────────────────
export interface CredentialSchemaField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'textarea' | 'number';
  required: boolean;
  helpText?: string;
}

export interface CredentialSchema {
  provider: CredentialProvider;
  displayName: string;
  icon: string;
  category: string;
  fields: CredentialSchemaField[];
  setupGuide?: string;
  verifiable: boolean;
  supportsOAuth: boolean;
}

// ── Upsert Payload ───────────────────────────────────────
export interface UpsertCredentialPayload {
  provider: CredentialProvider;
  instanceName?: string;
  credentials: Record<string, unknown>;
  description?: string;
  isPrimary?: boolean;
  dailyUsageLimit?: number;
  linkedAccountEmail?: string;
  webhookUrl?: string;
}

// ── Status Summary ───────────────────────────────────────
export interface CredentialStatusSummary {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  error: number;
}
