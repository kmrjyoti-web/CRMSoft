export interface QuotationTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category?: string;
  items: TemplateItem[];
  defaultDiscount?: number;
  defaultTerms?: string;
  defaultNotes?: string;
  defaultValidityDays?: number;
  applicableIndustries?: string[];
  applicableProductCategories?: string[];
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  productId: string;
  productName: string;
  productSku: string;
  defaultQuantity: number;
  defaultDiscount?: number;
  isOptional: boolean;
  notes?: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category?: string;
  items: Omit<TemplateItem, 'productName' | 'productSku'>[];
  defaultDiscount?: number;
  defaultTerms?: string;
  defaultNotes?: string;
  defaultValidityDays?: number;
  applicableIndustries?: string[];
  applicableProductCategories?: string[];
}

export interface UseTemplateDto {
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  adjustQuantities?: { productId: string; quantity: number }[];
}

export interface TemplateFilters {
  search?: string;
  category?: string;
  industry?: string;
}
