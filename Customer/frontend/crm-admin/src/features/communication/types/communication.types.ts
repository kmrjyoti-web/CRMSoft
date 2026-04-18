// ── Email Template Enums ──────────────────────────────────

export type TemplateCategory =
  | "SALES"
  | "MARKETING"
  | "SUPPORT"
  | "NOTIFICATION"
  | "OTHER";

// ── Email Template ────────────────────────────────────────

export interface EmailTemplateItem {
  id: string;
  name: string;
  category: TemplateCategory;
  description?: string | null;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  variables?: string[];
  isShared: boolean;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateListItem extends EmailTemplateItem {
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface EmailTemplateDetail extends EmailTemplateItem {
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface EmailTemplateCreateData {
  name: string;
  category: TemplateCategory;
  description?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: string[];
  isShared?: boolean;
}

export interface EmailTemplateUpdateData {
  name?: string;
  category?: TemplateCategory;
  description?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  variables?: string[];
  isShared?: boolean;
}

export interface EmailTemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: TemplateCategory;
  isShared?: boolean;
}

export interface TemplatePreviewData {
  sampleData?: Record<string, unknown>;
}

export interface TemplatePreviewResult {
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}

// ── Email Signature ───────────────────────────────────────

export interface EmailSignatureItem {
  id: string;
  name: string;
  bodyHtml: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSignatureCreateData {
  name: string;
  bodyHtml: string;
  isDefault?: boolean;
}

export interface EmailSignatureUpdateData {
  name?: string;
  bodyHtml?: string;
  isDefault?: boolean;
}
