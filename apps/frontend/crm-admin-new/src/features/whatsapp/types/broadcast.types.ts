import type { WaBroadcastStatus, WaBroadcastRecipientStatus } from './whatsapp.types';

export interface WaBroadcastItem {
  id: string;
  wabaId: string;
  name: string;
  templateId: string;
  template?: { name: string; category: string } | null;
  status: WaBroadcastStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  throttlePerSecond: number;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  optOutCount: number;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaBroadcastRecipientItem {
  id: string;
  broadcastId: string;
  phoneNumber: string;
  contactName?: string | null;
  variables?: Record<string, string> | null;
  status: WaBroadcastRecipientStatus;
  waMessageId?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
}

export interface BroadcastCreateData {
  wabaId: string;
  name: string;
  templateId: string;
  scheduledAt?: string;
  throttlePerSecond?: number;
}

export interface BroadcastRecipientData {
  phoneNumber: string;
  contactName?: string;
  variables?: Record<string, string>;
}

export interface BroadcastListParams {
  wabaId?: string;
  status?: WaBroadcastStatus;
  page?: number;
  limit?: number;
}

export interface BroadcastRecipientListParams {
  status?: WaBroadcastRecipientStatus;
  page?: number;
  limit?: number;
}
