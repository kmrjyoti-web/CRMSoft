import { DocumentCategory } from '@prisma/working-client';
export declare class UploadDocumentDto {
    category?: DocumentCategory;
    description?: string;
    tags?: string[];
    folderId?: string;
}
