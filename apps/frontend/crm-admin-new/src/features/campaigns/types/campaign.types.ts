// ── Enums ────────────────────────────────────────────────

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED";

// ── Entities ─────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  accountId: string;
  fromName?: string;
  replyToEmail?: string;
  totalRecipients: number;
  recipientSource?: string;
  recipientFilter?: Record<string, unknown>;
  status: CampaignStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  sendRatePerMinute: number;
  batchSize: number;
  trackOpens: boolean;
  trackClicks: boolean;
  includeUnsubscribe: boolean;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  name?: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "UNSUBSCRIBED";
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface Unsubscribe {
  id: string;
  email: string;
  contactId?: string;
  campaignId?: string;
  reason?: string;
  unsubscribedAt: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateCampaignDto {
  name: string;
  description?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  accountId: string;
  fromName?: string;
  replyToEmail?: string;
  templateId?: string;
  sendRatePerMinute?: number;
  batchSize?: number;
  trackOpens?: boolean;
  trackClicks?: boolean;
  includeUnsubscribe?: boolean;
  scheduledAt?: string;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface AddRecipientsDto {
  recipients: { email: string; name?: string }[];
}

export interface CampaignFilters {
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}
