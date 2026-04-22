import type { WaTemplateStatus, WaTemplateCategory } from './whatsapp.types';

export interface WaTemplateButton {
  type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL';
  text: string;
  payload?: string;
}

export interface WaTemplateItem {
  id: string;
  wabaId: string;
  metaTemplateId?: string | null;
  name: string;
  language: string;
  category: WaTemplateCategory;
  status: WaTemplateStatus;
  headerType?: string | null;
  headerContent?: string | null;
  bodyText: string;
  footerText?: string | null;
  buttons?: WaTemplateButton[] | null;
  variables?: Record<string, string> | null;
  sampleValues?: Record<string, string> | null;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  lastSyncedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaTemplateCreateData {
  wabaId: string;
  name: string;
  language?: string;
  category: WaTemplateCategory;
  headerType?: string;
  headerContent?: string;
  bodyText: string;
  footerText?: string;
  buttons?: WaTemplateButton[];
  variables?: Record<string, string>;
  sampleValues?: Record<string, string>;
}

export interface WaTemplateUpdateData {
  name?: string;
  bodyText?: string;
  footerText?: string;
  buttons?: WaTemplateButton[];
}

export interface WaTemplateListParams {
  wabaId?: string;
  status?: WaTemplateStatus;
  category?: WaTemplateCategory;
  page?: number;
  limit?: number;
}
