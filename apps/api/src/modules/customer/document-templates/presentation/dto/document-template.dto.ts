import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentType {
  INVOICE = 'INVOICE',
  QUOTATION = 'QUOTATION',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  RECEIPT = 'RECEIPT',
  PROFORMA = 'PROFORMA',
}

// ─── Create ───────────────────────────────────────────────
export class CreateDocumentTemplateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  htmlTemplate: string;

  @IsOptional()
  @IsString()
  cssStyles?: string;

  @IsOptional()
  @IsObject()
  defaultSettings?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableFields?: string[];

  @IsOptional()
  @IsString()
  industryCode?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ─── Update ───────────────────────────────────────────────
export class UpdateDocumentTemplateDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  htmlTemplate?: string;

  @IsOptional()
  @IsString()
  cssStyles?: string;

  @IsOptional()
  @IsObject()
  defaultSettings?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableFields?: string[];

  @IsOptional()
  @IsString()
  industryCode?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ─── Query ────────────────────────────────────────────────
export class TemplateQueryDto {
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  industryCode?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isSystem?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Customize ────────────────────────────────────────────
export class CustomizeTemplateDto {
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;

  @IsOptional()
  @IsString()
  customHeader?: string;

  @IsOptional()
  @IsString()
  customFooter?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  bankDetails?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ─── Render ───────────────────────────────────────────────
export class RenderDocumentDto {
  @IsString()
  templateId: string;

  @IsString()
  documentType: string;

  @IsString()
  documentId: string;
}

// class BulkRenderDto ──────────────────────────────────────
export class BulkRenderDto {
  @IsString()
  templateId: string;

  @IsString()
  documentType: string;

  @IsArray()
  @IsString({ each: true })
  documentIds: string[];
}
