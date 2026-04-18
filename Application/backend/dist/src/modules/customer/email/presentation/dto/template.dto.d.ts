import { TemplateCategory } from '@prisma/working-client';
export declare class CreateTemplateDto {
    name: string;
    category?: TemplateCategory;
    description?: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables?: Record<string, unknown>[];
    isShared?: boolean;
}
export declare class UpdateTemplateDto {
    name?: string;
    category?: TemplateCategory;
    description?: string;
    subject?: string;
    bodyHtml?: string;
    bodyText?: string;
    variables?: Record<string, unknown>[];
    isShared?: boolean;
}
export declare class TemplateQueryDto {
    category?: TemplateCategory;
    isShared?: boolean;
    search?: string;
}
export declare class PreviewTemplateDto {
    sampleData?: Record<string, any>;
}
