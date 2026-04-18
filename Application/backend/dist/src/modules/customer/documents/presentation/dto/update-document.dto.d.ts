import { DocumentCategory } from '@prisma/working-client';
export declare class UpdateDocumentDto {
    description?: string;
    category?: DocumentCategory;
    tags?: string[];
}
