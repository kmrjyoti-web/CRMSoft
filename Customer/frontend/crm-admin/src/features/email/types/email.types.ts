// ── Enums ────────────────────────────────────────────────

export type EmailStatus = "DRAFT" | "QUEUED" | "SCHEDULED" | "SENDING" | "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "CANCELLED" | "FAILED";
export type EmailDirection = "INBOUND" | "OUTBOUND";
export type EmailPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// ── Entities ─────────────────────────────────────────────

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath?: string;
  url?: string;
}

export interface Email {
  id: string;
  threadId: string;
  parentId?: string;
  accountId: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  from: string;
  fromName?: string;
  to: string[];
  toNames?: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  direction: EmailDirection;
  status: EmailStatus;
  priority?: EmailPriority;
  templateId?: string;
  signatureId?: string;
  scheduledAt?: string;
  sentAt?: string;
  isStarred: boolean;
  isRead: boolean;
  isArchived: boolean;
  openCount: number;
  clickCount: number;
  firstOpenedAt?: string;
  attachments: EmailAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participantEmails: string[];
  messageCount: number;
  lastMessageAt: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  emails?: Email[];
}

export interface EmailAccount {
  id: string;
  provider: "GMAIL" | "OUTLOOK" | "IMAP_SMTP";
  emailAddress: string;
  displayName?: string;
  label?: string;
  isDefault: boolean;
  isActive: boolean;
  dailySendLimit: number;
  todaySentCount: number;
  lastSyncAt?: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface ComposeEmailDto {
  accountId: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  signatureId?: string;
  replyToEmailId?: string;
  scheduledAt?: string;
  sendNow?: boolean;
  entityType?: string;
  entityId?: string;
  priority?: EmailPriority;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface ReplyEmailDto {
  originalEmailId: string;
  replyType: "REPLY" | "REPLY_ALL" | "FORWARD";
  to?: EmailAddress[];
  bodyHtml: string;
  bodyText?: string;
}

export interface EmailFilters {
  accountId?: string;
  direction?: EmailDirection;
  status?: EmailStatus;
  isStarred?: boolean;
  isRead?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmailAnalytics {
  totalSent: number;
  totalReceived: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  replyRate: number;
}
