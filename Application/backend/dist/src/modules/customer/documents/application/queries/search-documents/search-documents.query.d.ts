import { DocumentCategory, StorageType } from '@prisma/working-client';
export declare class SearchDocumentsQuery {
    readonly query: string;
    readonly page: number;
    readonly limit: number;
    readonly category?: DocumentCategory | undefined;
    readonly storageType?: StorageType | undefined;
    readonly tags?: string[] | undefined;
    readonly uploadedById?: string | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    readonly mimeType?: string | undefined;
    readonly minSize?: number | undefined;
    readonly maxSize?: number | undefined;
    constructor(query: string, page?: number, limit?: number, category?: DocumentCategory | undefined, storageType?: StorageType | undefined, tags?: string[] | undefined, uploadedById?: string | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined, mimeType?: string | undefined, minSize?: number | undefined, maxSize?: number | undefined);
}
