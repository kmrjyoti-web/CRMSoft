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
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTemplateDto {
  code: string;
  name: string;
  description?: string;
  documentType: string;
  htmlTemplate: string;
  cssStyles?: string;
  defaultSettings?: Record<string, unknown>;
  availableFields?: string[];
  industryCode?: string;
  sortOrder?: number;
  isDefault?: boolean;
}

export type UpdateDocumentTemplateDto = Partial<CreateDocumentTemplateDto>;

export interface DocumentTemplateFilters {
  search?: string;
  documentType?: string;
  industryCode?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
