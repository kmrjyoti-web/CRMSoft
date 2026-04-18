import { DocumentCategory, StorageType } from '@prisma/working-client';
export declare class GetDocumentListQuery {
    readonly page: number;
    readonly limit: number;
    readonly search?: string | undefined;
    readonly category?: DocumentCategory | undefined;
    readonly storageType?: StorageType | undefined;
    readonly folderId?: string | undefined;
    readonly uploadedById?: string | undefined;
    readonly tags?: string[] | undefined;
    constructor(page?: number, limit?: number, search?: string | undefined, category?: DocumentCategory | undefined, storageType?: StorageType | undefined, folderId?: string | undefined, uploadedById?: string | undefined, tags?: string[] | undefined);
}
