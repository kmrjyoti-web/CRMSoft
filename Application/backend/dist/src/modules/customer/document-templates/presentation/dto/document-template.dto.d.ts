export declare enum DocumentType {
    INVOICE = "INVOICE",
    QUOTATION = "QUOTATION",
    PURCHASE_ORDER = "PURCHASE_ORDER",
    DELIVERY_NOTE = "DELIVERY_NOTE",
    CREDIT_NOTE = "CREDIT_NOTE",
    RECEIPT = "RECEIPT",
    PROFORMA = "PROFORMA"
}
export declare class CreateDocumentTemplateDto {
    code: string;
    name: string;
    description?: string;
    documentType: DocumentType;
    htmlTemplate: string;
    cssStyles?: string;
    defaultSettings?: Record<string, any>;
    availableFields?: string[];
    industryCode?: string;
    sortOrder?: number;
    isDefault?: boolean;
}
export declare class UpdateDocumentTemplateDto {
    code?: string;
    name?: string;
    description?: string;
    documentType?: DocumentType;
    htmlTemplate?: string;
    cssStyles?: string;
    defaultSettings?: Record<string, any>;
    availableFields?: string[];
    industryCode?: string;
    sortOrder?: number;
    isDefault?: boolean;
}
export declare class TemplateQueryDto {
    documentType?: DocumentType;
    industryCode?: string;
    isActive?: boolean;
    isSystem?: boolean;
    page?: number;
    limit?: number;
}
export declare class CustomizeTemplateDto {
    customSettings?: Record<string, any>;
    customHeader?: string;
    customFooter?: string;
    termsAndConditions?: string;
    bankDetails?: string;
    signatureUrl?: string;
    logoUrl?: string;
    isDefault?: boolean;
}
export declare class RenderDocumentDto {
    templateId: string;
    documentType: string;
    documentId: string;
}
export declare class BulkRenderDto {
    templateId: string;
    documentType: string;
    documentIds: string[];
}
