// ── Document Template Types ─────────────────────────────────

export interface DocumentTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  documentType: string;
  htmlTemplate: string;
  cssStyles?: string;
  defaultSettings: Record<string, unknown>;
  availableFields: { key: string; label: string; group: string }[];
  industryCode?: string;
  isSystem: boolean;
  tenantId?: string;
  thumbnailUrl?: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCustomization {
  id: string;
  tenantId: string;
  templateId: string;
  customSettings: Record<string, unknown>;
  customHeader?: string;
  customFooter?: string;
  termsAndConditions?: string;
  bankDetails?: string;
  signatureUrl?: string;
  logoUrl?: string;
  isDefault: boolean;
}

export interface CustomizeTemplatePayload {
  customSettings?: Record<string, unknown>;
  customHeader?: string;
  customFooter?: string;
  termsAndConditions?: string;
  bankDetails?: string;
  signatureUrl?: string;
  logoUrl?: string;
  isDefault?: boolean;
}

export interface PreviewPayload {
  templateId: string;
  documentType: string;
  documentId: string;
}

export interface PdfPayload {
  templateId: string;
  entityId: string;
  entityType: string;
  customSettings?: Record<string, unknown>;
}

export interface TemplateListParams {
  documentType?: string;
  isActive?: boolean;
}
